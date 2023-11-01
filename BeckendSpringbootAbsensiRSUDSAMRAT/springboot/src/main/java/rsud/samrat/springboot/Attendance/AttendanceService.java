package rsud.samrat.springboot.Attendance;

import org.springframework.web.multipart.MultipartFile;
import rsud.samrat.springboot.Attendance.DTOs.*;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    AttendanceCreateResponseDTO addAttendanceToSchedule(AttendanceCreateRequestDTO requestDTO, MultipartFile selfieCheckInImage);

    AttendanceCreateResponseDTO addAttendanceToScheduleNoValidations(AttendanceCreateRequestDTO requestDTO, MultipartFile selfieCheckInImage);
    List<AttendanceCreateResponseDTO> getAllAttendanceByDate(LocalDate attendanceDate);
    AttendanceCreateResponseDTO updateAttendanceStatusAndCheckoutDetails(AttendanceUpdateRequestDTO requestDTO, MultipartFile selfieCheckOutImage);

    List<AttendanceCreateResponseDTO> getAllAttendanceByDateAndEmployee(LocalDate attendanceDate, Long employeeId);

    List<AttendanceScheduleDTO> getAllAttendanceWithSchedule();
    List<AttendanceScheduleIdDTO> getAllAttendanceWithScheduleId();

    List<AttendanceScheduleIdDTO> filterAttendances(AttendanceFilterDTO filterDTO);

    List<AttendanceQualityResponseDTO> calculateQualityRateByEmployeeAndMonth(Long employeeId, int month);
}

