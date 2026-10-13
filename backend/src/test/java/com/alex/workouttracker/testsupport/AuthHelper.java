package com.alex.workouttracker.testsupport;

import static com.alex.workouttracker.testsupport.CsrfTestHelper.withCsrf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.alex.workouttracker.auth.dto.LoginRequest;
import com.alex.workouttracker.auth.dto.RegisterRequest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

public class AuthHelper {
  private final MockMvc mvc;
  private final JsonMapper jsonMapper;

  public AuthHelper(MockMvc mvc, JsonMapper jsonMapper) {
    this.mvc = mvc;
    this.jsonMapper = jsonMapper;
  }

  public void registerUser(String email, String password) throws Exception {
    var request = new RegisterRequest(email, password);
    mvc.perform(
            withCsrf(mvc, post("/api/auth/register"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value(email))
        .andExpect(jsonPath("$.id").exists());
  }

  public MockHttpSession loginUser(String email, String password) throws Exception {
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
}
