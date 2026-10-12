package com.alex.workouttracker.testsupport;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

public class CsrfTestHelper {

  private CsrfTestHelper() {}

  public static MockHttpServletRequestBuilder withCsrf(
      MockMvc mvc, MockHttpServletRequestBuilder request) throws Exception {
    var response = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();

    Cookie cookie = response.getResponse().getCookie("XSRF-TOKEN");

    if (cookie == null) {
      throw new IllegalStateException("CSRF cookie missing");
    }

    return request.cookie(cookie).header("X-XSRF-TOKEN", cookie.getValue());
  }
}
