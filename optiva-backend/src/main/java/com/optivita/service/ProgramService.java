package com.optivita.service;

import com.optivita.dto.program.*;
import com.optivita.entity.*;
import com.optivita.entity.enums.*;
import com.optivita.exception.BadRequestException;
import com.optivita.exception.ResourceNotFoundException;
import com.optivita.repository.CheckpointRepository;
import com.optivita.repository.ProgressEntryRepository;
import com.optivita.repository.ProgramRepository;
import com.optivita.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository programRepository;
    private final CheckpointRepository checkpointRepository;
    private final ProgressEntryRepository progressEntryRepository;
    private final UserRepository userRepository;

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // PROGRAM CRUD
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    @Transactional
    public ProgramResponse create(UUID userId, ProgramRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LocalDate start = request.getStartDate();
        LocalDate end = (request.getEndDate() != null) ? request.getEndDate() : start.plusMonths(12);

        Program program = Program.builder()
                .user(user)
                .startDate(start)
                .endDate(end)
                .notes(request.getNotes())
                .build();

        program = programRepository.save(program);
        buildMilestoneCheckpoints(program, start);
        program = programRepository.save(program);
        return mapToResponse(program);
    }

    @Transactional(readOnly = true)
    public List<ProgramResponse> getAllByUser(UUID userId) {
        return programRepository.findByUserIdOrderByStartDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProgramResponse getById(UUID userId, UUID programId) {
        Program program = programRepository.findByIdAndUserId(programId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", programId));
        return mapToResponse(program);
    }

    @Transactional
    public ProgramResponse update(UUID userId, UUID programId, ProgramRequest request) {
        Program program = programRepository.findByIdAndUserId(programId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", programId));

        if (request.getStartDate() != null) program.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)   program.setEndDate(request.getEndDate());
        if (request.getNotes() != null)     program.setNotes(request.getNotes());

        // NOTE: changing startDate does NOT silently shift checkpoints.
        // Call POST /programs/{id}/checkpoints/regenerate explicitly.
        return mapToResponse(programRepository.save(program));
    }

    @Transactional
    public void delete(UUID userId, UUID programId) {
        Program program = programRepository.findByIdAndUserId(programId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", programId));
        programRepository.delete(program);
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // CHECKPOINT OPERATIONS
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    @Transactional
    public CheckpointResponse updateCheckpoint(UUID userId, UUID programId, UUID checkpointId,
                                               CheckpointUpdateRequest request) {
        Program program = programRepository.findByIdAndUserId(programId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", programId));

        Checkpoint checkpoint = checkpointRepository.findByIdAndProgramId(checkpointId, program.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Checkpoint", "id", checkpointId));

        if (request.getStatus() != null)          checkpoint.setStatus(request.getStatus());
        if (request.getPhase() != null)           checkpoint.setPhase(request.getPhase());
        if (request.getFocusTags() != null)       checkpoint.setFocusTags(request.getFocusTags());
        if (request.getTargetWeightKg() != null)  checkpoint.setTargetWeightKg(request.getTargetWeightKg());
        if (request.getNotes() != null)           checkpoint.setNotes(request.getNotes());
        if (request.getTargetMetrics() != null)   checkpoint.setTargetMetrics(mapToTargetMetrics(request.getTargetMetrics()));

        return mapCheckpointToResponse(checkpointRepository.save(checkpoint));
    }

    /**
     * Deletes all existing checkpoints for the program and regenerates the
     * 5 standard 12-month milestones from the program's current startDate.
     *
     * <p>This must be called explicitly when startDate changes â€” checkpoints
     * are never silently shifted on a program update.</p>
     */
    @Transactional
    public List<CheckpointResponse> regenerateCheckpoints(UUID userId, UUID programId) {
        Program program = programRepository.findByIdAndUserId(programId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", programId));

        program.getCheckpoints().clear();
        programRepository.save(program);

        buildMilestoneCheckpoints(program, program.getStartDate());
        program = programRepository.save(program);

        return program.getCheckpoints().stream()
                .map(this::mapCheckpointToResponse)
                .toList();
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // CHECKPOINT EVALUATION
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    /**
     * Evaluates a checkpoint by analysing the last 2â€“4 ProgressEntry records
     * recorded before the checkpoint date.
     *
     * <p>Scoring: for each metric that has a target, a "met" flag is set.
     * Overall status:</p>
     * <ul>
     *   <li>AHEAD    â€“ â‰¥ 80 % of tracked metrics met AND at least one metric
     *                  significantly exceeds its target</li>
     *   <li>ON_TRACK â€“ â‰¥ 60 % of tracked metrics met</li>
     *   <li>BEHIND   â€“ &lt; 60 % of tracked metrics met</li>
     * </ul>
     */
    @Transactional(readOnly = true)
    public CheckpointEvaluationResponse evaluateCheckpoint(UUID userId, UUID programId, UUID checkpointId) {
        Program program = programRepository.findByIdAndUserId(programId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", programId));

        Checkpoint cp = checkpointRepository.findByIdAndProgramId(checkpointId, program.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Checkpoint", "id", checkpointId));

        List<ProgressEntry> recent = progressEntryRepository
                .findTop4ByProgramIdAndDateBeforeOrderByDateDesc(programId, cp.getCheckpointDate());

        if (recent.isEmpty()) {
            throw new BadRequestException(
                    "No progress entries found before checkpoint date " + cp.getCheckpointDate()
                    + ". Log at least one progress entry to evaluate this checkpoint.");
        }

        TargetMetrics targets = cp.getTargetMetrics();

        double avgWeightChange  = averageWeightChange(recent);
        double avgWaistChange   = averageWaistChange(recent);
        double avgWorkoutsPerWk = averageWorkoutsPerWeek(recent);
        double avgSteps         = recent.stream()
                .filter(e -> e.getStepsAvg() != null)
                .mapToInt(ProgressEntry::getStepsAvg).average().orElse(0);
        double avgDietCompliance = recent.stream()
                .filter(e -> e.getDietComplianceScore() != null)
                .mapToInt(ProgressEntry::getDietComplianceScore).average().orElse(0);

        int totalMetrics = 0;
        int metMetrics   = 0;
        boolean anySignificantlyAhead = false;

        if (targets != null) {
            if (targets.getTargetWeightChangeKg() != null) {
                totalMetrics++;
                if (targets.getTargetWeightChangeKg() < 0) {
                    if (avgWeightChange <= targets.getTargetWeightChangeKg()) metMetrics++;
                    if (avgWeightChange <= targets.getTargetWeightChangeKg() * 1.2) anySignificantlyAhead = true;
                } else {
                    if (avgWeightChange >= targets.getTargetWeightChangeKg()) metMetrics++;
                    if (avgWeightChange >= targets.getTargetWeightChangeKg() * 1.2) anySignificantlyAhead = true;
                }
            }
            if (targets.getTargetWaistChangeCm() != null) {
                totalMetrics++;
                if (targets.getTargetWaistChangeCm() < 0) {
                    if (avgWaistChange <= targets.getTargetWaistChangeCm()) metMetrics++;
                    if (avgWaistChange <= targets.getTargetWaistChangeCm() * 1.2) anySignificantlyAhead = true;
                } else {
                    if (avgWaistChange >= targets.getTargetWaistChangeCm()) metMetrics++;
                }
            }
            if (targets.getTrainingDaysPerWeek() != null) {
                totalMetrics++;
                if (avgWorkoutsPerWk >= targets.getTrainingDaysPerWeek()) {
                    metMetrics++;
                    if (avgWorkoutsPerWk >= targets.getTrainingDaysPerWeek() + 1) anySignificantlyAhead = true;
                }
            }
            if (targets.getStepsAverage() != null) {
                totalMetrics++;
                if (avgSteps >= targets.getStepsAverage()) {
                    metMetrics++;
                    if (avgSteps >= targets.getStepsAverage() * 1.1) anySignificantlyAhead = true;
                }
            }
            if (targets.getDietComplianceTarget() != null) {
                totalMetrics++;
                if (avgDietCompliance >= targets.getDietComplianceTarget()) {
                    metMetrics++;
                    if (avgDietCompliance >= targets.getDietComplianceTarget() + 10) anySignificantlyAhead = true;
                }
            }
        }

        EvaluationStatus overallStatus;
        String summary;

        if (totalMetrics == 0) {
            overallStatus = EvaluationStatus.ON_TRACK;
            summary = "No target metrics defined for this checkpoint. Set targetMetrics to get a scored evaluation.";
        } else {
            double pct = (double) metMetrics / totalMetrics;
            if (pct >= 0.8 && anySignificantlyAhead) {
                overallStatus = EvaluationStatus.AHEAD;
                summary = String.format("Excellent progress â€” %d/%d targets surpassed. You are ahead of schedule.",
                        metMetrics, totalMetrics);
            } else if (pct >= 0.6) {
                overallStatus = EvaluationStatus.ON_TRACK;
                summary = String.format("Solid progress â€” %d/%d targets met. Keep the current trajectory.",
                        metMetrics, totalMetrics);
            } else {
                overallStatus = EvaluationStatus.BEHIND;
                summary = String.format("Only %d/%d targets met. Review diet compliance and training consistency.",
                        metMetrics, totalMetrics);
            }
        }

        return CheckpointEvaluationResponse.builder()
                .checkpointId(cp.getId())
                .checkpointTitle(cp.getTitle())
                .checkpointDate(cp.getCheckpointDate())
                .status(overallStatus)
                .summary(summary)
                .entriesAnalyzed(recent.size())
                .avgWeightChangeKg(round2(avgWeightChange))
                .targetWeightChangeKg(targets != null ? targets.getTargetWeightChangeKg() : null)
                .avgWaistChangeCm(round2(avgWaistChange))
                .targetWaistChangeCm(targets != null ? targets.getTargetWaistChangeCm() : null)
                .avgWorkoutsPerWeek(round2(avgWorkoutsPerWk))
                .targetTrainingDaysPerWeek(targets != null ? targets.getTrainingDaysPerWeek() : null)
                .avgStepsAvg(round2(avgSteps))
                .targetStepsAverage(targets != null ? targets.getStepsAverage() : null)
                .avgDietCompliance(round2(avgDietCompliance))
                .targetDietCompliance(targets != null ? targets.getDietComplianceTarget() : null)
                .build();
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // PROGRESS ENTRY CRUD
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    @Transactional
    public ProgressEntryResponse addProgressEntry(UUID userId, UUID programId, ProgressEntryRequest request) {
        Program program = programRepository.findByIdAndUserId(programId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", programId));

        ProgressEntry entry = ProgressEntry.builder()
                .program(program)
                .date(request.getDate())
                .weightKg(request.getWeightKg())
                .waistCm(request.getWaistCm())
                .stepsAvg(request.getStepsAvg())
                .workoutsCompleted(request.getWorkoutsCompleted())
                .dietComplianceScore(request.getDietComplianceScore())
                .notes(request.getNotes())
                .photos(photosToString(request.getPhotos()))
                .build();

        return mapProgressToResponse(progressEntryRepository.save(entry));
    }

    @Transactional(readOnly = true)
    public List<ProgressEntryResponse> getProgressEntries(UUID userId, UUID programId,
                                                          LocalDate from, LocalDate to) {
        programRepository.findByIdAndUserId(programId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", programId));

        List<ProgressEntry> entries = (from != null && to != null)
                ? progressEntryRepository.findByProgramIdAndDateBetweenOrderByDateAsc(programId, from, to)
                : progressEntryRepository.findByProgramIdOrderByDateDesc(programId);

        return entries.stream().map(this::mapProgressToResponse).toList();
    }

    @Transactional
    public void deleteProgressEntry(UUID userId, UUID programId, UUID entryId) {
        programRepository.findByIdAndUserId(programId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Program", "id", programId));

        ProgressEntry entry = progressEntryRepository.findByIdAndProgramId(entryId, programId)
                .orElseThrow(() -> new ResourceNotFoundException("ProgressEntry", "id", entryId));

        progressEntryRepository.delete(entry);
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // PRIVATE â€” CHECKPOINT GENERATION
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    /**
     * Generates the 5 standard 12-month transformation milestones.
     *
     * <pre>
     * start + 14 days  â†’ Kickoff / Habit Lock-in   FOUNDATION
     * start + 1 month  â†’ 30-Day Foundation          FOUNDATION
     * start + 3 months â†’ 12-Week Fat Loss           CUT_1
     * start + 6 months â†’ 6-Month Recomposition      BUILD
     * start + 12 monthsâ†’ 12-Month Peak / Maintain   MAINTAIN
     * </pre>
     */
    private void buildMilestoneCheckpoints(Program program, LocalDate start) {
        List<Checkpoint> milestones = new ArrayList<>();

        milestones.add(Checkpoint.builder()
                .program(program)
                .checkpointDate(start.plusDays(14))
                .title("Kickoff / Habit Lock-in")
                .phase(CheckpointPhase.FOUNDATION)
                .focusTags(Arrays.asList(FocusTag.HABITS, FocusTag.CARDIO))
                .targetMetrics(TargetMetrics.builder()
                        .targetWeightChangeKg(-1.0).targetWaistChangeCm(-1.0)
                        .trainingDaysPerWeek(3).stepsAverage(7000).dietComplianceTarget(70)
                        .build())
                .status(CheckpointStatus.UPCOMING)
                .build());

        milestones.add(Checkpoint.builder()
                .program(program)
                .checkpointDate(start.plusMonths(1))
                .title("30-Day Foundation")
                .phase(CheckpointPhase.FOUNDATION)
                .focusTags(Arrays.asList(FocusTag.HABITS, FocusTag.MOBILITY, FocusTag.CARDIO))
                .targetMetrics(TargetMetrics.builder()
                        .targetWeightChangeKg(-2.0).targetWaistChangeCm(-2.0)
                        .trainingDaysPerWeek(3).stepsAverage(8000).dietComplianceTarget(75)
                        .build())
                .status(CheckpointStatus.UPCOMING)
                .build());

        milestones.add(Checkpoint.builder()
                .program(program)
                .checkpointDate(start.plusMonths(3))
                .title("12-Week Fat Loss")
                .phase(CheckpointPhase.CUT_1)
                .focusTags(Arrays.asList(FocusTag.CARDIO, FocusTag.ABS, FocusTag.HABITS))
                .targetMetrics(TargetMetrics.builder()
                        .targetWeightChangeKg(-6.0).targetWaistChangeCm(-5.0)
                        .trainingDaysPerWeek(4).stepsAverage(9000).dietComplianceTarget(80)
                        .build())
                .status(CheckpointStatus.UPCOMING)
                .build());

        milestones.add(Checkpoint.builder()
                .program(program)
                .checkpointDate(start.plusMonths(6))
                .title("6-Month Recomposition")
                .phase(CheckpointPhase.BUILD)
                .focusTags(Arrays.asList(FocusTag.STRENGTH, FocusTag.ABS, FocusTag.CARDIO))
                .targetMetrics(TargetMetrics.builder()
                        .targetWeightChangeKg(-10.0).targetWaistChangeCm(-8.0)
                        .trainingDaysPerWeek(5).stepsAverage(9500).dietComplianceTarget(82)
                        .build())
                .status(CheckpointStatus.UPCOMING)
                .build());

        milestones.add(Checkpoint.builder()
                .program(program)
                .checkpointDate(start.plusMonths(12))
                .title("12-Month Peak / Maintain")
                .phase(CheckpointPhase.MAINTAIN)
                .focusTags(Arrays.asList(FocusTag.STRENGTH, FocusTag.MOBILITY, FocusTag.HABITS))
                .targetMetrics(TargetMetrics.builder()
                        .targetWeightChangeKg(-14.0).targetWaistChangeCm(-12.0)
                        .trainingDaysPerWeek(4).stepsAverage(10000).dietComplianceTarget(85)
                        .build())
                .status(CheckpointStatus.UPCOMING)
                .build());

        program.getCheckpoints().addAll(milestones);
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // PRIVATE â€” MAPPERS
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    private ProgramResponse mapToResponse(Program program) {
        return ProgramResponse.builder()
                .id(program.getId())
                .userId(program.getUser().getId())
                .startDate(program.getStartDate())
                .endDate(program.getEndDate())
                .notes(program.getNotes())
                .checkpoints(program.getCheckpoints().stream()
                        .map(this::mapCheckpointToResponse).toList())
                .createdAt(program.getCreatedAt())
                .updatedAt(program.getUpdatedAt())
                .build();
    }

    private CheckpointResponse mapCheckpointToResponse(Checkpoint cp) {
        return CheckpointResponse.builder()
                .id(cp.getId())
                .programId(cp.getProgram().getId())
                .checkpointDate(cp.getCheckpointDate())
                .title(cp.getTitle())
                .phase(cp.getPhase())
                .focusTags(cp.getFocusTags())
                .targetMetrics(mapFromTargetMetrics(cp.getTargetMetrics()))
                .targetWeightKg(cp.getTargetWeightKg())
                .notes(cp.getNotes())
                .status(cp.getStatus())
                .build();
    }

    private ProgressEntryResponse mapProgressToResponse(ProgressEntry e) {
        return ProgressEntryResponse.builder()
                .id(e.getId())
                .programId(e.getProgram().getId())
                .date(e.getDate())
                .weightKg(e.getWeightKg())
                .waistCm(e.getWaistCm())
                .stepsAvg(e.getStepsAvg())
                .workoutsCompleted(e.getWorkoutsCompleted())
                .dietComplianceScore(e.getDietComplianceScore())
                .notes(e.getNotes())
                .photos(photosToList(e.getPhotos()))
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private TargetMetrics mapToTargetMetrics(TargetMetricsDto dto) {
        if (dto == null) return null;
        return TargetMetrics.builder()
                .targetWeightChangeKg(dto.getTargetWeightChangeKg())
                .targetWaistChangeCm(dto.getTargetWaistChangeCm())
                .trainingDaysPerWeek(dto.getTrainingDaysPerWeek())
                .stepsAverage(dto.getStepsAverage())
                .dietComplianceTarget(dto.getDietComplianceTarget())
                .build();
    }

    private TargetMetricsDto mapFromTargetMetrics(TargetMetrics m) {
        if (m == null) return null;
        return TargetMetricsDto.builder()
                .targetWeightChangeKg(m.getTargetWeightChangeKg())
                .targetWaistChangeCm(m.getTargetWaistChangeCm())
                .trainingDaysPerWeek(m.getTrainingDaysPerWeek())
                .stepsAverage(m.getStepsAverage())
                .dietComplianceTarget(m.getDietComplianceTarget())
                .build();
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // PRIVATE â€” ANALYTICS HELPERS
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    /** Weight change = newest weight - oldest weight (within the window). */
    private double averageWeightChange(List<ProgressEntry> entries) {
        List<ProgressEntry> withWeight = entries.stream()
                .filter(e -> e.getWeightKg() != null).toList();
        if (withWeight.size() < 2) return 0.0;
        double oldest = withWeight.get(withWeight.size() - 1).getWeightKg();
        double newest = withWeight.get(0).getWeightKg();
        return newest - oldest;
    }

    private double averageWaistChange(List<ProgressEntry> entries) {
        List<ProgressEntry> withWaist = entries.stream()
                .filter(e -> e.getWaistCm() != null).toList();
        if (withWaist.size() < 2) return 0.0;
        double oldest = withWaist.get(withWaist.size() - 1).getWaistCm();
        double newest = withWaist.get(0).getWaistCm();
        return newest - oldest;
    }

    /** Returns average workouts per entry (each entry ~1 week). */
    private double averageWorkoutsPerWeek(List<ProgressEntry> entries) {
        List<ProgressEntry> with = entries.stream()
                .filter(e -> e.getWorkoutsCompleted() != null).toList();
        if (with.isEmpty()) return 0.0;
        return with.stream().mapToInt(ProgressEntry::getWorkoutsCompleted).average().orElse(0);
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    private String photosToString(List<String> photos) {
        if (photos == null || photos.isEmpty()) return null;
        return String.join(",", photos);
    }

    private List<String> photosToList(String photos) {
        if (photos == null || photos.isBlank()) return List.of();
        return Arrays.asList(photos.split(","));
    }
}

