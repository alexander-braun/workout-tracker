package com.alex.workouttracker.auth;

import static com.alex.workouttracker.testsupport.CsrfTestHelper.withCsrf;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.alex.workouttracker.auth.dto.ChangeEmailRequest;
import com.alex.workouttracker.auth.dto.LoginRequest;
import com.alex.workouttracker.auth.dto.RegisterRequest;
import com.alex.workouttracker.auth.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class AuthIntegrationTest {
  @Container
  static final PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17-alpine");

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
  }

  private final MockMvc mvc;
  private final JsonMapper jsonMapper;
  private final AppUserRepository appUsers;
  private final PasswordEncoder encoder;

  @Autowired
  AuthIntegrationTest(
      MockMvc mvc, JsonMapper jsonMapper, AppUserRepository appUser, PasswordEncoder encoder) {
    this.mvc = mvc;
    this.jsonMapper = jsonMapper;
    this.appUsers = appUser;
    this.encoder = encoder;
  }

  private void registerUser(String email, String password) throws Exception {
    var request = new RegisterRequest(email, password);
    mvc.perform(
            withCsrf(mvc, post("/api/auth/register"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value(email))
        .andExpect(jsonPath("$.id").exists());
  }

  private MockHttpSession loginUser(String email, String password) throws Exception {
    var request = new LoginRequest(email, password);

    var result =
        mvc.perform(
                withCsrf(mvc, post("/api/auth/login"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)))
            .andExpect(status().is(204))
            .andReturn();

    MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);

    assertNotNull(session);
    return session;
  }

  @Test
  void registersUser() throws Exception {
    var email = "test@example.com";
    var pw = "testpassword123";
    registerUser(email, pw);
    var user = appUsers.findByEmailIgnoreCase(email).orElseThrow();
    assertNotEquals(pw, user.getPasswordHash());
    assertTrue(encoder.matches(pw, user.getPasswordHash()));
  }

  @Test
  void rejectsDuplicateRegistration() throws Exception {
    var email = "test1@example.com";
    var pw = "testpassword123";
    var request1 = new RegisterRequest(email, pw);
    registerUser(email, pw);
    mvc.perform(
            withCsrf(mvc, post("/api/auth/register"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(request1)))
        .andExpect(status().isConflict());
  }

  @Test
  void logsInRegisteredUser() throws Exception {
    var email = "test2@example.com";
    var pw = "testpassword123";
    registerUser(email, pw);
    var session = loginUser(email, pw);

    mvc.perform(get("/api/auth/me").session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value(email));
  }

  @Test
  void rejectsInvalidCredentials() throws Exception {
    var loginRequest = new LoginRequest("test3@example.com", "testpassword321");
    MockHttpSession session = new MockHttpSession();
    registerUser("test3@example.com", "testpassword123");

    mvc.perform(
            withCsrf(mvc, post("/api/auth/login"))
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(loginRequest)))
        .andExpect(status().isUnauthorized());
    mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isUnauthorized());
  }

  @Test
  void logsOutAuthenticatedUser() throws Exception {
    var email = "test4@example.com";
    var pw = "testpassword123";
    registerUser(email, pw);
    var session = loginUser(email, pw);

    mvc.perform(get("/api/auth/me").session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value(email));

    mvc.perform(withCsrf(mvc, post("/api/auth/logout")).session(session))
        .andExpect(status().isNoContent());

    mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isUnauthorized());
  }

  @Test
  void rejectsInvalidEmail() throws Exception {
    var email = "test";
    var password = "testpassword123";
    var request = new RegisterRequest(email, password);
    mvc.perform(
            withCsrf(mvc, post("/api/auth/register"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
    assertFalse(appUsers.existsByEmailIgnoreCase(email));
  }

  @Test
  void rejectsShortPassword() throws Exception {
    var email = "test5@example.com";
    var password = "123";
    var request = new RegisterRequest(email, password);
    mvc.perform(
            withCsrf(mvc, post("/api/auth/register"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(request)))
        .andExpect(status().isBadRequest());
    assertFalse(appUsers.existsByEmailIgnoreCase(email));
  }

  @Test
  void rejectsMissingCsrfToken() throws Exception {
    var email = "test6@example.com";
    var pw = "testpassword123";
    var request = new RegisterRequest(email, pw);
    mvc.perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(request)))
        .andExpect(status().isForbidden());
    assertFalse(appUsers.existsByEmailIgnoreCase(email));
  }

  @Test
  void rejectsUnauthenticatedRequest() throws Exception {
    var email = "test7@example.com";
    var request = new ChangeEmailRequest(email);
    mvc.perform(
            withCsrf(mvc, put("/api/auth/email"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(request)))
        .andExpect(status().isUnauthorized());
  }
}
