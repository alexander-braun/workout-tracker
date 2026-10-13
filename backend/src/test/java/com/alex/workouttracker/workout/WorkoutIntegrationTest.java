package com.alex.workouttracker.workout;

import static com.alex.workouttracker.testsupport.CsrfTestHelper.withCsrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.alex.workouttracker.testsupport.AuthHelper;
import com.alex.workouttracker.testsupport.PostgresIntegrationTest;
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
public class WorkoutIntegrationTest extends PostgresIntegrationTest {
  private final MockMvc mvc;
  private final JsonMapper jsonMapper;
  private final AuthHelper authHelper;

  @Autowired
  public WorkoutIntegrationTest(MockMvc mvc, JsonMapper jsonMapper) {
    this.jsonMapper = jsonMapper;
    this.mvc = mvc;
    this.authHelper = new AuthHelper(mvc, jsonMapper);
  }

  @Test
  void isolatesWorkoutsBetweenUsers() throws Exception {
    var aliceEmail = "alice@test.de";
    var alicePassword = "supersafe123";
    var bobEmail = "bob@test.de";
    var bobPassword = "supersafe123";
    authHelper.registerUser(aliceEmail, alicePassword);
    authHelper.registerUser(bobEmail, bobPassword);
    var aliceSession = authHelper.loginUser(aliceEmail, alicePassword);
    var bobSession = authHelper.loginUser(bobEmail, bobPassword);

    // Create entry for alice
    WorkoutEntryRequest aliceEntry =
        new WorkoutEntryRequest(null, "myExercise", 3, 10, null, WeightUnit.KG, "notes alice", 3);
    var aliceWorkout = new SaveWorkoutRequest(List.of(aliceEntry));

    // Create entry for bob
    WorkoutEntryRequest bobEntry =
        new WorkoutEntryRequest(null, "myExercise", 4, 11, null, WeightUnit.LBS, "notes bob", 2);
    var bobWorkout = new SaveWorkoutRequest(List.of(bobEntry));

    var date = "2026-10-13";
    // Alice creates her workout
    mvc.perform(
            withCsrf(mvc, put("/api/workouts/" + date))
                .session(aliceSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(aliceWorkout)))
        .andExpect(status().isOk());

    // Bob tries to get a workout for the same date
    mvc.perform(get("/api/workouts/" + date).session(bobSession))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.entries").isEmpty());

    // Bob creates a workout for the same date
    mvc.perform(
            withCsrf(mvc, put("/api/workouts/" + date))
                .session(bobSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(bobWorkout)))
        .andExpect(status().isOk());

    // Alice tries to get her workout
    mvc.perform(get("/api/workouts/" + date).session(aliceSession))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.entries[1]").doesNotExist())
        .andExpect(jsonPath("$.entries[0].sets").value(3))
        .andExpect(jsonPath("$.entries[0].reps").value(10))
        .andExpect(jsonPath("$.entries[0].weight").isEmpty())
        .andExpect(jsonPath("$.entries[0].notes").value("notes alice"))
        .andExpect(jsonPath("$.entries[0].position").value(3))
        .andExpect(jsonPath("$.entries[0].unit").value("kg"))
        .andExpect(jsonPath("$.entries[0].exerciseId").isNotEmpty())
        .andExpect(jsonPath("$.entries[0].id").isNotEmpty());

    // Bob tries to get his workout
    mvc.perform(get("/api/workouts/" + date).session(bobSession))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.entries[1]").doesNotExist())
        .andExpect(jsonPath("$.entries[0].sets").value(4))
        .andExpect(jsonPath("$.entries[0].reps").value(11))
        .andExpect(jsonPath("$.entries[0].weight").isEmpty())
        .andExpect(jsonPath("$.entries[0].notes").value("notes bob"))
        .andExpect(jsonPath("$.entries[0].position").value(2))
        .andExpect(jsonPath("$.entries[0].unit").value("lbs"))
        .andExpect(jsonPath("$.entries[0].exerciseId").isNotEmpty())
        .andExpect(jsonPath("$.entries[0].id").isNotEmpty());

    // Delete bobs workout
    mvc.perform(withCsrf(mvc, delete("/api/workouts/" + date)).session(bobSession))
        .andExpect(status().isOk());

    // Try to retrieve it again
    mvc.perform(get("/api/workouts/" + date).session(bobSession))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.entries").isEmpty());

    // Alices workout still exists
    mvc.perform(get("/api/workouts/" + date).session(aliceSession))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.entries[1]").doesNotExist())
        .andExpect(jsonPath("$.entries[0].sets").value(3))
        .andExpect(jsonPath("$.entries[0].reps").value(10))
        .andExpect(jsonPath("$.entries[0].weight").isEmpty())
        .andExpect(jsonPath("$.entries[0].notes").value("notes alice"))
        .andExpect(jsonPath("$.entries[0].position").value(3))
        .andExpect(jsonPath("$.entries[0].unit").value("kg"))
        .andExpect(jsonPath("$.entries[0].exerciseId").isNotEmpty())
        .andExpect(jsonPath("$.entries[0].id").isNotEmpty());
  }

  @Test
  void rejectsExerciseIdBelongingToAnotherUser() throws Exception {
    var aliceEmail = "alice@test.de";
    var alicePassword = "supersafe123";
    var bobEmail = "bob@test.de";
    var bobPassword = "supersafe123";
    authHelper.registerUser(aliceEmail, alicePassword);
    authHelper.registerUser("bob@test.de", bobPassword);
    var aliceSession = authHelper.loginUser(aliceEmail, alicePassword);
    var bobSession = authHelper.loginUser(bobEmail, bobPassword);

    // Create entry for alice
    WorkoutEntryRequest aliceEntry =
        new WorkoutEntryRequest(null, "myExercise", 3, 10, null, WeightUnit.KG, "notes alice", 3);
    var aliceWorkout = new SaveWorkoutRequest(List.of(aliceEntry));

    var date = "2026-10-13";
    // Alice creates her workout
    var result =
        mvc.perform(
                withCsrf(mvc, put("/api/workouts/" + date))
                    .session(aliceSession)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(aliceWorkout)))
            .andExpect(status().isOk())
            .andReturn();

    // Extract id from response
    var json = jsonMapper.readTree(result.getResponse().getContentAsString());
    var exerciseId = json.get("entries").get(0).get("exerciseId").asString();

    // Create entry for bob
    WorkoutEntryRequest bobEntry =
        new WorkoutEntryRequest(
            UUID.fromString(exerciseId),
            "myExercise1",
            4,
            11,
            null,
            WeightUnit.LBS,
            "notes bob",
            2);
    var bobWorkout = new SaveWorkoutRequest(List.of(bobEntry));

    // Bob tries to save a workout with an exercise that has the same id as alice's excercise
    mvc.perform(
            withCsrf(mvc, put("/api/workouts/" + date))
                .session(bobSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(bobWorkout)))
        .andExpect(status().isBadRequest());

    // Bob has no workout for the date
    mvc.perform(get("/api/workouts/" + date).session(bobSession))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.entries").isEmpty());

    // Alices workout still exists
    mvc.perform(get("/api/workouts/" + date).session(aliceSession))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.entries[1]").doesNotExist())
        .andExpect(jsonPath("$.entries[0].sets").value(3))
        .andExpect(jsonPath("$.entries[0].reps").value(10))
        .andExpect(jsonPath("$.entries[0].weight").isEmpty())
        .andExpect(jsonPath("$.entries[0].notes").value("notes alice"))
        .andExpect(jsonPath("$.entries[0].position").value(3))
        .andExpect(jsonPath("$.entries[0].unit").value("kg"))
        .andExpect(jsonPath("$.entries[0].exerciseId").value(exerciseId))
        .andExpect(jsonPath("$.entries[0].id").isNotEmpty());
  }

  @Test
  void updatesExistingWorkout() throws Exception {
    var email = "update@test.de";
    var password = "supersafe123";
    var date = "2026-10-13";

    authHelper.registerUser(email, password);
    var session = authHelper.loginUser(email, password);

    // Create initial workout
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
    var workoutId = json.get("id").asString();
    var exerciseId = UUID.fromString(json.get("entries").get(0).get("exerciseId").asString());

    // Update existing workout
    var updatedWorkout =
        new SaveWorkoutRequest(
            List.of(
                new WorkoutEntryRequest(
                    exerciseId, null, 4, 12, null, WeightUnit.BW, "Updated workout", 0)));

    mvc.perform(
            withCsrf(mvc, put("/api/workouts/" + date))
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(updatedWorkout)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(workoutId))
        .andExpect(jsonPath("$.entries[0].exerciseId").value(exerciseId.toString()));

    // Retrieve workout and verify updated values
    mvc.perform(get("/api/workouts/" + date).session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(workoutId))
        .andExpect(jsonPath("$.entries.length()").value(1))
        .andExpect(jsonPath("$.entries[0].exerciseId").value(exerciseId.toString()))
        .andExpect(jsonPath("$.entries[0].sets").value(4))
        .andExpect(jsonPath("$.entries[0].reps").value(12))
        .andExpect(jsonPath("$.entries[0].notes").value("Updated workout"));

    // Ensure no duplicate workout was created
    mvc.perform(get("/api/workouts").session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].id").value(workoutId));
  }

  @Test
  void isolatesWorkoutHistoryBetweenUsers() throws Exception {
    var password = "supersafe123";

    authHelper.registerUser("alice@test.de", password);
    authHelper.registerUser("bob@test.de", password);

    var aliceSession = authHelper.loginUser("alice@test.de", password);
    var bobSession = authHelper.loginUser("bob@test.de", password);

    var aliceWorkout1 =
        new SaveWorkoutRequest(
            List.of(
                new WorkoutEntryRequest(
                    null, "Ring Rows", 3, 10, null, WeightUnit.BW, "Alice workout 1", 0)));

    var aliceWorkout2 =
        new SaveWorkoutRequest(
            List.of(
                new WorkoutEntryRequest(
                    null, "Push Ups", 4, 12, null, WeightUnit.BW, "Alice workout 2", 0)));

    var bobWorkout =
        new SaveWorkoutRequest(
            List.of(
                new WorkoutEntryRequest(
                    null, "Squats", 3, 15, null, WeightUnit.BW, "Bob workout", 0)));

    // Alice saves two workouts on different dates
    mvc.perform(
            withCsrf(mvc, put("/api/workouts/2026-10-10"))
                .session(aliceSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(aliceWorkout1)))
        .andExpect(status().isOk());

    mvc.perform(
            withCsrf(mvc, put("/api/workouts/2026-10-12"))
                .session(aliceSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(aliceWorkout2)))
        .andExpect(status().isOk());

    // Bob saves one workout
    mvc.perform(
            withCsrf(mvc, put("/api/workouts/2026-10-11"))
                .session(bobSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(bobWorkout)))
        .andExpect(status().isOk());

    // Alice sees only her two workouts
    mvc.perform(get("/api/workouts").session(aliceSession))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].date").value("2026-10-10"))
        .andExpect(jsonPath("$[0].entries.length()").value(1))
        .andExpect(jsonPath("$[0].entries[0].notes").value("Alice workout 1"))
        .andExpect(jsonPath("$[1].date").value("2026-10-12"))
        .andExpect(jsonPath("$[1].entries.length()").value(1))
        .andExpect(jsonPath("$[1].entries[0].notes").value("Alice workout 2"));

    // Bob sees only his own workout
    mvc.perform(get("/api/workouts").session(bobSession))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].date").value("2026-10-11"))
        .andExpect(jsonPath("$[0].entries.length()").value(1))
        .andExpect(jsonPath("$[0].entries[0].notes").value("Bob workout"));
  }
}
