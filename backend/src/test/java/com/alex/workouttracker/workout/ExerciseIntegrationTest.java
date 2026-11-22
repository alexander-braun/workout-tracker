package com.alex.workouttracker.workout;

import static com.alex.workouttracker.testsupport.CsrfTestHelper.withCsrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.alex.workouttracker.testsupport.AuthHelper;
import com.alex.workouttracker.testsupport.PostgresIntegrationTest;
import com.alex.workouttracker.workout.dto.MergeExercisesRequest;
import com.alex.workouttracker.workout.dto.RenameExerciseRequest;
import com.alex.workouttracker.workout.dto.SaveWorkoutRequest;
import com.alex.workouttracker.workout.dto.WorkoutEntryRequest;
import com.alex.workouttracker.workout.model.WeightUnit;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
public class ExerciseIntegrationTest extends PostgresIntegrationTest {
  private final MockMvc mvc;
  private final JsonMapper jsonMapper;
  private final AuthHelper authHelper;

  @Autowired
  public ExerciseIntegrationTest(MockMvc mvc, JsonMapper jsonMapper) {
    this.jsonMapper = jsonMapper;
    this.mvc = mvc;
    this.authHelper = new AuthHelper(mvc, jsonMapper);
  }

  @Test
  void renamingAnExerciseWorks() throws Exception {
    var email = "update@test.de";
    var password = "supersafe123";
    var date = "2026-10-13";

    authHelper.registerUser(email, password);
    var session = authHelper.loginUser(email, password);
    var initialWorkout =
        new SaveWorkoutRequest(
            List.of(
                new WorkoutEntryRequest(
                    null, "Ring Rows", 3, 8, null, WeightUnit.BW, "Initial workout", 0)));
    var result =
        mvc.perform(
                withCsrf(mvc, put("/api/workouts/" + date))
                    .session(session)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(initialWorkout)))
            .andExpect(status().isOk())
            .andReturn();
    var json = jsonMapper.readTree(result.getResponse().getContentAsString());
    var exerciseId = UUID.fromString(json.get("entries").get(0).get("exerciseId").asString());

    var renameRequest = new RenameExerciseRequest("Ringrows");

    mvc.perform(
            withCsrf(mvc, patch("/api/exercises/" + exerciseId))
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(renameRequest)))
        .andExpect(status().isNoContent());

    mvc.perform(get("/api/exercises/{id}", exerciseId).session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Ringrows"));
  }

  @Test
  void mergingTheSameExerciseErrors() throws Exception {
    var email = "update@test.de";
    var password = "supersafe123";
    var date = "2026-10-13";

    authHelper.registerUser(email, password);
    var session = authHelper.loginUser(email, password);
    var workout =
        new SaveWorkoutRequest(
            List.of(
                new WorkoutEntryRequest(
                    null, "Ringrows", 5, 4, null, WeightUnit.BW, "second workout", 0)));

    var workoutResponse =
        mvc.perform(
                withCsrf(mvc, put("/api/workouts/" + date))
                    .session(session)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(workout)))
            .andExpect(status().isOk())
            .andReturn();
    var secondJson = jsonMapper.readTree(workoutResponse.getResponse().getContentAsString());
    var secondExerciseId =
        UUID.fromString(secondJson.get("entries").get(0).get("exerciseId").asString());

    var mergeRequest = new MergeExercisesRequest(secondExerciseId);

    // try to merge the same exercises
    mvc.perform(
            withCsrf(mvc, post("/api/exercises/{sourceExerciseId}/merge", secondExerciseId))
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(mergeRequest)))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.message").value("Source exercise and target exercise are the same."));

    mvc.perform(get("/api/exercises/{id}", secondExerciseId).session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Ringrows"));
  }

  @Test
  void mergingExercisesWithOverlappingEntriesWorks() throws Exception {
    var email = "update@test.de";
    var password = "supersafe123";
    var date = "2026-10-13";

    authHelper.registerUser(email, password);
    var session = authHelper.loginUser(email, password);
    var workoutRequest =
        new SaveWorkoutRequest(
            List.of(
                new WorkoutEntryRequest(
                    null, "Ring Rows", 4, 5, null, WeightUnit.BW, "first workout", 0),
                new WorkoutEntryRequest(
                    null, "Ringrows", 3, 8, null, WeightUnit.BW, "second workout", 1)));
    var workout1Result =
        mvc.perform(
                withCsrf(mvc, put("/api/workouts/" + date))
                    .session(session)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(workoutRequest)))
            .andExpect(status().isOk())
            .andReturn();
    var json = jsonMapper.readTree(workout1Result.getResponse().getContentAsString());
    var sourceExerciseId = UUID.fromString(json.get("entries").get(0).get("exerciseId").asString());
    var targetExerciseId = UUID.fromString(json.get("entries").get(1).get("exerciseId").asString());

    var mergeRequest = new MergeExercisesRequest(targetExerciseId);
    mvc.perform(
            withCsrf(mvc, post("/api/exercises/{sourceExerciseId}/merge", sourceExerciseId))
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(mergeRequest)))
        .andExpect(status().isOk());

    mvc.perform(get("/api/exercises/{id}", sourceExerciseId).session(session))
        .andExpect(status().isBadRequest());

    mvc.perform(get("/api/exercises/{id}", targetExerciseId).session(session))
        .andExpect(status().isOk());

    mvc.perform(get("/api/workouts/" + date).session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.entries.length()").value(1))
        .andExpect(jsonPath("$.entries[0].exerciseId").value(targetExerciseId.toString()))
        .andExpect(jsonPath("$.entries[0].sets").value(3))
        .andExpect(jsonPath("$.entries[0].reps").value(8))
        .andExpect(jsonPath("$.entries[0].notes").value("second workout"))
        .andExpect(jsonPath("$.entries[1]").doesNotExist());
  }

  @Test
  void mergingExercisesWorks() throws Exception {
    var email = "update@test.de";
    var password = "supersafe123";
    var date1 = "2026-10-13";
    var date2 = "2026-10-14";

    authHelper.registerUser(email, password);
    var session = authHelper.loginUser(email, password);
    var workout1Request =
        new SaveWorkoutRequest(
            List.of(
                new WorkoutEntryRequest(
                    null, "Ring Rows", 3, 8, null, WeightUnit.BW, "first workout", 0)));
    var workout2Result =
        new SaveWorkoutRequest(
            List.of(
                new WorkoutEntryRequest(
                    null, "Ringrows", 5, 4, null, WeightUnit.BW, "second workout", 0)));

    var workout1Result =
        mvc.perform(
                withCsrf(mvc, put("/api/workouts/" + date1))
                    .session(session)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(workout1Request)))
            .andExpect(status().isOk())
            .andReturn();
    var json = jsonMapper.readTree(workout1Result.getResponse().getContentAsString());
    var sourceExerciseId = UUID.fromString(json.get("entries").get(0).get("exerciseId").asString());

    var workout2Response =
        mvc.perform(
                withCsrf(mvc, put("/api/workouts/" + date2))
                    .session(session)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(workout2Result)))
            .andExpect(status().isOk())
            .andReturn();
    json = jsonMapper.readTree(workout2Response.getResponse().getContentAsString());

    var targetExerciseId = UUID.fromString(json.get("entries").get(0).get("exerciseId").asString());
    var mergeRequest = new MergeExercisesRequest(targetExerciseId);
    mvc.perform(
            withCsrf(mvc, post("/api/exercises/{sourceExerciseId}/merge", sourceExerciseId))
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(mergeRequest)))
        .andExpect(status().isOk());

    // old id does not exist
    mvc.perform(get("/api/exercises/{id}", sourceExerciseId).session(session))
        .andExpect(status().isBadRequest());

    // new id still exists
    mvc.perform(get("/api/exercises/{id}", targetExerciseId).session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Ringrows"));

    // both workouts have the new id
    mvc.perform(get("/api/workouts/" + date1).session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.entries[0].exerciseId").value(targetExerciseId.toString()));

    mvc.perform(get("/api/workouts/" + date2).session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.entries[0].exerciseId").value(targetExerciseId.toString()));
  }
}
