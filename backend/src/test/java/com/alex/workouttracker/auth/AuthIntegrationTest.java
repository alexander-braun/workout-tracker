package com.alex.workouttracker.auth;

import static com.alex.workouttracker.testsupport.CsrfTestHelper.withCsrf;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
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
import com.alex.workouttracker.testsupport.AuthHelper;
import com.alex.workouttracker.testsupport.PostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest extends PostgresIntegrationTest {
  private final MockMvc mvc;
  private final JsonMapper jsonMapper;
  private final AppUserRepository appUsers;
  private final PasswordEncoder encoder;
  private final AuthHelper authHelper;

  @Autowired
  AuthIntegrationTest(
      MockMvc mvc, JsonMapper jsonMapper, AppUserRepository appUser, PasswordEncoder encoder) {
    this.mvc = mvc;
    this.jsonMapper = jsonMapper;
    this.appUsers = appUser;
    this.encoder = encoder;
    this.authHelper = new AuthHelper(mvc, jsonMapper);
  }

  @Test
  void registersUser() throws Exception {
    var email = "test@example.com";
    var pw = "testpassword123";
    authHelper.registerUser(email, pw);
    var user = appUsers.findByEmailIgnoreCase(email).orElseThrow();
    assertNotEquals(pw, user.getPasswordHash());
    assertTrue(encoder.matches(pw, user.getPasswordHash()));
  }

  @Test
  void rejectsDuplicateRegistration() throws Exception {
    var email = "test1@example.com";
    var pw = "testpassword123";
    var request1 = new RegisterRequest(email, pw);
    authHelper.registerUser(email, pw);
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
    authHelper.registerUser(email, pw);
    var session = authHelper.loginUser(email, pw);

    mvc.perform(get("/api/auth/me").session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value(email));
  }

  @Test
  void rejectsInvalidCredentials() throws Exception {
    var loginRequest = new LoginRequest("test3@example.com", "testpassword321");
    MockHttpSession session = new MockHttpSession();
    authHelper.registerUser("test3@example.com", "testpassword123");

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
    authHelper.registerUser(email, pw);
    var session = authHelper.loginUser(email, pw);

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
