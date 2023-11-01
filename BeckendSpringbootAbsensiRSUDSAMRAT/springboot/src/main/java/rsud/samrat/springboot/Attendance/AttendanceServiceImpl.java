package rsud.samrat.springboot.Attendance;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import rsud.samrat.springboot.Attendance.DTOs.*;
import rsud.samrat.springboot.Employee.DTOs.CreateEmployeeResponseDTO;
import rsud.samrat.springboot.Employee.EmployeeModel;
import rsud.samrat.springboot.Employee.EmployeeRepository;
import rsud.samrat.springboot.Exception.NotFoundException;
import rsud.samrat.springboot.Locations.DTOs.LocationsCreateResponseDTO;
import rsud.samrat.springboot.Locations.LocationModel;
import rsud.samrat.springboot.Locations.LocationRepository;
import rsud.samrat.springboot.Schedule.ScheduleModel;
import rsud.samrat.springboot.Schedule.ScheduleRepository;
import rsud.samrat.springboot.Shift.DTOs.ShiftResponseDTO;
import rsud.samrat.springboot.Shift.ShiftModel;
import rsud.samrat.springboot.Utility.ImageCompressionUtil;

import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ScheduleRepository scheduleRepository;
    private final EmployeeRepository employeeRepository;
    private final LocationRepository locationRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public AttendanceServiceImpl(
            AttendanceRepository attendanceRepository,
            ScheduleRepository scheduleRepository,
            EmployeeRepository employeeRepository,
            LocationRepository locationRepository, ModelMapper modelMapper
    ) {
        this.attendanceRepository = attendanceRepository;
        this.scheduleRepository = scheduleRepository;
        this.employeeRepository = employeeRepository;
        this.locationRepository = locationRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public AttendanceCreateResponseDTO addAttendanceToSchedule(AttendanceCreateRequestDTO requestDTO, MultipartFile selfieCheckInImage) {
        Long scheduleId = requestDTO.getScheduleId();
        ScheduleModel schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new NotFoundException("Schedule not found with id: " + scheduleId));

        Long employeeId = requestDTO.getEmployeeId();
        EmployeeModel employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found with id: " + employeeId));

        LocalDate attendanceDate = requestDTO.getAttendanceDate();
        // Check if the employee has already checked in for the specified date
        boolean hasCheckedIn = attendanceRepository.existsByEmployeesContainsAndAttendanceDate(employee, attendanceDate);

        if (hasCheckedIn) {
            throw new IllegalArgumentException("Employee has already checked in for the specified date: " + attendanceDate);
        }


        LocalDate scheduleDate = schedule.getSchedule_date();

        // Check if attendance date is the same as the schedule date
        if (!attendanceDate.isEqual(scheduleDate)) {
            throw new IllegalArgumentException("Attendance date must match the schedule date.");
        }

        LocalTime shiftStartTime = schedule.getShift().getStart_time();
        LocalTime fifteenMinutesBeforeShift = shiftStartTime.minusMinutes(15);
        LocalTime currentClockInTime = requestDTO.getClockIn().toLocalTime();

        // Check if clock-in is at least 15 minutes before shift start time
        if (currentClockInTime.isBefore(fifteenMinutesBeforeShift)) {
            throw new IllegalArgumentException("Clock-in time cannot be less than 15 minutes before shift start time.");
        }

        AttendanceModel attendance = new AttendanceModel();
        attendance.setSchedule(schedule);
        attendance.getEmployees().add(employee);

        // Set the default status to CheckIn
        attendance.setStatus(AttendanceStatus.CheckIn);

        attendance.setAttendance_date(attendanceDate);
        attendance.setClock_in(requestDTO.getClockIn());
        attendance.setClock_out(requestDTO.getClockOut());

        // Set default values to other attributes (null by default)
        attendance.setLocation_lat_In(requestDTO.getLocationLatIn());
        attendance.setLocation_long_In(requestDTO.getLocationLongIn());
        attendance.setLocation_lat_Out(null);
        attendance.setLocation_Long_Out(null);

        if (selfieCheckInImage != null && !selfieCheckInImage.isEmpty()) {
            try {
                int targetWidth = 800;
                int targetHeight = 600;
                float compressionQuality = 0.8f;

                // Use the utility class for image compression
                byte[] compressedImage = ImageCompressionUtil.compressImage(selfieCheckInImage, targetWidth, targetHeight, compressionQuality);

                // Save the compressed image to a temporary file for inspection
               // String tempFilePath = "compressed_image.jpg"; // Specify the temporary file path
               // try (FileOutputStream fos = new FileOutputStream(tempFilePath)) {
               //     fos.write(compressedImage);
               // } catch (IOException e) {
                //   throw new RuntimeException("Failed to save compressed image to a temporary file.", e);
               // }

                // Set the compressed image data to the attendance model
                attendance.setSelfieCheckIn(compressedImage);
            } catch (IOException e) {
                throw new RuntimeException("Failed to compress and store selfieCheckInImage data.", e);
            }
        }
        attendance.setSelfieCheckOut(null);
        attendance.setAttendanceType(requestDTO.getAttendanceType());

        // Set the default attendance state to null
        attendance.setAttendanceState(null);

        AttendanceModel savedAttendance = attendanceRepository.save(attendance);

        AttendanceCreateResponseDTO responseDTO = new AttendanceCreateResponseDTO();
        responseDTO.setAttendanceId(savedAttendance.getAttendance_id());
        responseDTO.setScheduleId(scheduleId);
        responseDTO.setEmployee(mapEmployeeToCreateEmployeeResponseDTO(employee));
        responseDTO.setScheduleDate(savedAttendance.getAttendance_date());
        responseDTO.setShift(mapShiftToShiftResponseDTO(schedule.getShift()));
        responseDTO.setStatus(savedAttendance.getStatus());
        responseDTO.setAttendanceType(savedAttendance.getAttendanceType());
        responseDTO.setClockIn(savedAttendance.getClock_in());
        responseDTO.setClockOut(savedAttendance.getClock_out());
        responseDTO.setLocationLatIn(savedAttendance.getLocation_lat_In());
        responseDTO.setLocationLongIn(savedAttendance.getLocation_long_In());
        responseDTO.setLocationLatOut(savedAttendance.getLocation_lat_Out());
        responseDTO.setLocationLongOut(savedAttendance.getLocation_Long_Out());
        responseDTO.setSelfieCheckIn(savedAttendance.getSelfieCheckIn());
        responseDTO.setSelfieCheckOut(savedAttendance.getSelfieCheckOut());

        // Fetch the LocationModel from the schedule
        LocationModel location = schedule.getLocation();
        if (location != null) {
            // Manually set the location information in the response DTO
            LocationsCreateResponseDTO locationDTO = new LocationsCreateResponseDTO();
            locationDTO.setLocationId(location.getLocationId());
            locationDTO.setLocationName(location.getLocationName());
            locationDTO.setLatitude(location.getLatitude());
            locationDTO.setLongitude(location.getLongitude());
            responseDTO.setLocation(locationDTO);
        }

        return responseDTO;
    }

    @Override
    public AttendanceCreateResponseDTO addAttendanceToScheduleNoValidations(AttendanceCreateRequestDTO requestDTO, MultipartFile selfieCheckInImage) {
        Long scheduleId = requestDTO.getScheduleId();
        ScheduleModel schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new NotFoundException("Schedule not found with id: " + scheduleId));

        Long employeeId = requestDTO.getEmployeeId();
        EmployeeModel employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found with id: " + employeeId));

        LocalDate attendanceDate = requestDTO.getAttendanceDate();
        // Check if the employee has already checked in for the specified date
        boolean hasCheckedIn = attendanceRepository.existsByEmployeesContainsAndAttendanceDate(employee, attendanceDate);

        if (hasCheckedIn) {
            throw new IllegalArgumentException("Employee has already checked in for the specified date: " + attendanceDate);
        }

        LocalDate scheduleDate = schedule.getSchedule_date();

        // Check if attendance date is the same as the schedule date
        if (!attendanceDate.isEqual(scheduleDate)) {
            throw new IllegalArgumentException("Attendance date must match the schedule date.");
        }

        AttendanceModel attendance = new AttendanceModel();
        attendance.setSchedule(schedule);
        attendance.getEmployees().add(employee);

        // Set the default status to CheckIn
        attendance.setStatus(AttendanceStatus.CheckIn);

        attendance.setAttendance_date(attendanceDate);
        attendance.setClock_in(requestDTO.getClockIn());
        attendance.setClock_out(requestDTO.getClockOut());

        // Set default values to other attributes (null by default)
        attendance.setLocation_lat_In(requestDTO.getLocationLatIn());
        attendance.setLocation_long_In(requestDTO.getLocationLongIn());
        attendance.setLocation_lat_Out(null);
        attendance.setLocation_Long_Out(null);

        if (selfieCheckInImage != null && !selfieCheckInImage.isEmpty()) {
            try {
                int targetWidth = 800;
                int targetHeight = 600;
                float compressionQuality = 0.8f;

                // Use the utility class for image compression
                byte[] compressedImage = ImageCompressionUtil.compressImage(selfieCheckInImage, targetWidth, targetHeight, compressionQuality);

                // Set the compressed image data to the attendance model
                attendance.setSelfieCheckIn(compressedImage);
            } catch (IOException e) {
                throw new RuntimeException("Failed to compress and store selfieCheckInImage data.", e);
            }
        }
        attendance.setSelfieCheckOut(null);
        attendance.setAttendanceType(requestDTO.getAttendanceType());

        // Set the default attendance state to null
        attendance.setAttendanceState(null);

        AttendanceModel savedAttendance = attendanceRepository.save(attendance);

        AttendanceCreateResponseDTO responseDTO = new AttendanceCreateResponseDTO();
        responseDTO.setAttendanceId(savedAttendance.getAttendance_id());
        responseDTO.setScheduleId(scheduleId);
        responseDTO.setEmployee(mapEmployeeToCreateEmployeeResponseDTO(employee));
        responseDTO.setScheduleDate(savedAttendance.getAttendance_date());
        responseDTO.setShift(mapShiftToShiftResponseDTO(schedule.getShift()));
        responseDTO.setStatus(savedAttendance.getStatus());
        responseDTO.setAttendanceType(savedAttendance.getAttendanceType());
        responseDTO.setClockIn(savedAttendance.getClock_in());
        responseDTO.setClockOut(savedAttendance.getClock_out());
        responseDTO.setLocationLatIn(savedAttendance.getLocation_lat_In());
        responseDTO.setLocationLongIn(savedAttendance.getLocation_long_In());
        responseDTO.setLocationLatOut(savedAttendance.getLocation_lat_Out());
        responseDTO.setLocationLongOut(savedAttendance.getLocation_Long_Out());

        // Fetch the LocationModel from the schedule
        LocationModel location = schedule.getLocation();
        if (location != null) {
            // Manually set the location information in the response DTO
            LocationsCreateResponseDTO locationDTO = new LocationsCreateResponseDTO();
            locationDTO.setLocationId(location.getLocationId());
            locationDTO.setLocationName(location.getLocationName());
            locationDTO.setLatitude(location.getLatitude());
            locationDTO.setLongitude(location.getLongitude());
            responseDTO.setLocation(locationDTO);
        }

        return responseDTO;
    }






    @Override
    public List<AttendanceCreateResponseDTO> getAllAttendanceByDate(LocalDate attendanceDate) {
        List<AttendanceModel> attendanceRecords = attendanceRepository.findAllByAttendanceDate(attendanceDate);

        List<AttendanceCreateResponseDTO> attendanceList = new ArrayList<>();

        for (AttendanceModel attendance : attendanceRecords) {
            AttendanceCreateResponseDTO responseDTO = modelMapper.map(attendance, AttendanceCreateResponseDTO.class);
            responseDTO.setScheduleId(attendance.getSchedule().getSchedule_id());
            responseDTO.setEmployee(modelMapper.map(attendance.getEmployees().get(0), CreateEmployeeResponseDTO.class));
            responseDTO.setShift(modelMapper.map(attendance.getSchedule().getShift(), ShiftResponseDTO.class));

            LocationModel location = attendance.getSchedule().getLocation();
            if (location != null) {
                LocationsCreateResponseDTO locationDTO = modelMapper.map(location, LocationsCreateResponseDTO.class);
                responseDTO.setLocation(locationDTO);
            }

            attendanceList.add(responseDTO);
        }

        return attendanceList;
    }

    @Override
    public List<AttendanceCreateResponseDTO> getAllAttendanceByDateAndEmployee(LocalDate attendanceDate, Long employeeId) {
        List<AttendanceModel> attendanceRecords = attendanceRepository.findAllByAttendanceDateAndEmployeeId(attendanceDate, employeeId);

        List<AttendanceCreateResponseDTO> attendanceList = new ArrayList<>();

        for (AttendanceModel attendance : attendanceRecords) {
            AttendanceCreateResponseDTO responseDTO = new AttendanceCreateResponseDTO();
            responseDTO.setAttendanceId(attendance.getAttendance_id());
            responseDTO.setScheduleId(attendance.getSchedule().getSchedule_id());

            // Map EmployeeModel to CreateEmployeeResponseDTO
            EmployeeModel employee = attendance.getEmployees().get(0);
            CreateEmployeeResponseDTO employeeDTO = new CreateEmployeeResponseDTO();
            employeeDTO.setEmployeeId(employee.getEmployee_id());
            employeeDTO.setName(employee.getName());
            // Set other employee properties
            responseDTO.setEmployee(employeeDTO);

            // Map ShiftModel to ShiftResponseDTO
            ShiftModel shift = attendance.getSchedule().getShift();
            ShiftResponseDTO shiftDTO = new ShiftResponseDTO();
            shiftDTO.setShift_id(shift.getShift_id());
            shiftDTO.setName(shift.getName());
            // Set other shift properties
            responseDTO.setShift(shiftDTO);

            // Map LocationModel to LocationsCreateResponseDTO
            LocationModel location = attendance.getSchedule().getLocation();
            if (location != null) {
                LocationsCreateResponseDTO locationDTO = new LocationsCreateResponseDTO();
                locationDTO.setLocationId(location.getLocationId());
                locationDTO.setLocationName(location.getLocationName());
                locationDTO.setLatitude(location.getLatitude());
                locationDTO.setLongitude(location.getLongitude());
                responseDTO.setLocation(locationDTO);
            }

            // Set other responseDTO properties
            responseDTO.setStatus(attendance.getStatus());
            responseDTO.setAttendanceType(attendance.getAttendanceType());
            responseDTO.setClockIn(attendance.getClock_in());
            responseDTO.setClockOut(attendance.getClock_out());
            responseDTO.setLocationLatIn(attendance.getLocation_lat_In());
            responseDTO.setLocationLongIn(attendance.getLocation_long_In());
            responseDTO.setLocationLatOut(attendance.getLocation_lat_Out());
            responseDTO.setLocationLongOut(attendance.getLocation_Long_Out());
            responseDTO.setSelfieCheckIn(attendance.getSelfieCheckIn());
            responseDTO.setSelfieCheckOut(attendance.getSelfieCheckOut());

            attendanceList.add(responseDTO);
        }

        return attendanceList;
    }


    @Override
    public AttendanceCreateResponseDTO updateAttendanceStatusAndCheckoutDetails(AttendanceUpdateRequestDTO requestDTO, MultipartFile selfieCheckOutImage) {
        Long attendanceId = requestDTO.getAttendanceId();

        // Fetch the AttendanceModel using the provided attendanceId
        AttendanceModel attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new NotFoundException("Attendance not found with id: " + attendanceId));

        // Check if the employee has already checked out for this attendance
        if (attendance.getStatus() == AttendanceStatus.CheckOut) {
            throw new IllegalArgumentException("Employee has already checked out for this attendance.");
        }
        // Update the checkout details
        attendance.setClock_out(requestDTO.getClockOut());
        attendance.setLocation_lat_Out(requestDTO.getLocationLatOut());
        attendance.setLocation_Long_Out(requestDTO.getLocationLongOut());
        if (selfieCheckOutImage != null && !selfieCheckOutImage.isEmpty()) {
            try {
                int targetWidth = 800;
                int targetHeight = 600;
                float compressionQuality = 0.8f;

                // Use the utility class for image compression
                byte[] compressedImage = ImageCompressionUtil.compressImage(selfieCheckOutImage, targetWidth, targetHeight, compressionQuality);

                // Set the compressed image data to the attendance model
                attendance.setSelfieCheckOut(compressedImage);
            } catch (IOException e) {
                throw new RuntimeException("Failed to compress and store selfieCheckOutImage data.", e);
            }
        }

        // Calculate the attendance state based on the clock-in and clock-out times
        if (attendance.getClock_in() != null && attendance.getClock_out() != null) {
            LocalTime shiftStartTime = attendance.getSchedule().getShift().getStart_time();
            LocalTime shiftEndTime = attendance.getSchedule().getShift().getEnd_time();
            LocalTime clockInTime = attendance.getClock_in().toLocalTime();
            LocalTime clockOutTime = attendance.getClock_out().toLocalTime();

            if (clockInTime.isBefore(shiftStartTime.minusMinutes(15))) {
                attendance.setAttendanceState(AttendanceState.LATE);
            } else if (clockInTime.isBefore(shiftStartTime) || clockOutTime.isAfter(shiftEndTime.plusMinutes(30))) {
                attendance.setAttendanceState(AttendanceState.ON_TIME);
            } else {
                attendance.setAttendanceState(AttendanceState.LATE);
            }

            // Check if clock out is more than 4 hours after shift end
            if (clockOutTime.isAfter(shiftEndTime.plusHours(4))) {
                attendance.setAttendanceState(AttendanceState.ABSENT);
            } else {
                attendance.setStatus(AttendanceStatus.CheckOut);
            }
        } else if (attendance.getClock_in() != null) {
            LocalTime shiftStartTime = attendance.getSchedule().getShift().getStart_time();
            LocalTime clockInTime = attendance.getClock_in().toLocalTime();

            if (clockInTime.isBefore(shiftStartTime.plusHours(1))) {
                attendance.setAttendanceState(AttendanceState.ABSENT);
            } else {
                attendance.setAttendanceState(AttendanceState.LATE);
            }
        } else {
            attendance.setAttendanceState(AttendanceState.ABSENT);
        }

        // Save the updated attendance record
        AttendanceModel updatedAttendance = attendanceRepository.save(attendance);

        // Map the updated attendance record to AttendanceCreateResponseDTO
        AttendanceCreateResponseDTO responseDTO = modelMapper.map(updatedAttendance, AttendanceCreateResponseDTO.class);

        // Set the attendanceState and status in the responseDTO
        responseDTO.setAttendanceState(updatedAttendance.getAttendanceState());
        responseDTO.setStatus(updatedAttendance.getStatus());

        return responseDTO;
    }



    private ShiftResponseDTO mapShiftToShiftResponseDTO(ShiftModel shift) {
        ModelMapper modelMapper = new ModelMapper();
        return modelMapper.map(shift, ShiftResponseDTO.class);
    }

    private CreateEmployeeResponseDTO mapEmployeeToCreateEmployeeResponseDTO(EmployeeModel employee) {
        ModelMapper modelMapper = new ModelMapper();

        // Explicitly set the employeeId from the EmployeeModel to the response DTO
        CreateEmployeeResponseDTO employeeDTO = modelMapper.map(employee, CreateEmployeeResponseDTO.class);
        employeeDTO.setEmployeeId(employee.getEmployee_id());

        return employeeDTO;
    }

    //todo: paginations
    @Override
    public List<AttendanceScheduleDTO> getAllAttendanceWithSchedule() {
        List<AttendanceModel> attendanceRecords = attendanceRepository.findAll();

        List<AttendanceScheduleDTO> result = new ArrayList<>();

        for (AttendanceModel attendance : attendanceRecords) {
            // Skip attendance records with no schedule
            if (attendance.getSchedule() == null) {
                continue;
            }

            // Create a new AttendanceScheduleDTO for each schedule
            AttendanceScheduleDTO scheduleDTO = new AttendanceScheduleDTO();
            scheduleDTO.setScheduleId(attendance.getSchedule().getSchedule_id());
            scheduleDTO.setScheduleDate(attendance.getSchedule().getSchedule_date());
            scheduleDTO.setShift(mapShiftToShiftResponseDTO(attendance.getSchedule().getShift()));

            // Fetch and set location information if available
            LocationModel location = attendance.getSchedule().getLocation();
            if (location != null) {
                LocationsCreateResponseDTO locationDTO = modelMapper.map(location, LocationsCreateResponseDTO.class);
                scheduleDTO.setLocation(locationDTO);
            }

            // Add attendance details to the scheduleDTO
            AttendanceCreateResponseDTO attendanceDTO = modelMapper.map(attendance, AttendanceCreateResponseDTO.class);
            attendanceDTO.setScheduleId(attendance.getSchedule().getSchedule_id());
            attendanceDTO.setEmployee(mapEmployeeToCreateEmployeeResponseDTO(attendance.getEmployees().get(0)));
            scheduleDTO.getAttendances().add(attendanceDTO);

            result.add(scheduleDTO);
        }

        return result;
    }


    public List<AttendanceScheduleIdDTO> getAllAttendanceWithScheduleId() {
        List<AttendanceModel> attendanceRecords = attendanceRepository.findAll();

        Map<Long, AttendanceScheduleIdDTO> scheduleIdMap = new HashMap<>();

        for (AttendanceModel attendance : attendanceRecords) {
            // Skip attendance records with no schedule
            if (attendance.getSchedule() == null) {
                continue;
            }

            Long scheduleId = attendance.getSchedule().getSchedule_id();
            AttendanceScheduleIdDTO scheduleIdDTO = scheduleIdMap.getOrDefault(scheduleId, new AttendanceScheduleIdDTO());

            if (scheduleIdDTO.getScheduleId() == null) {
                scheduleIdDTO.setScheduleId(scheduleId);
            }

            // Create the AttendanceCreateResponseDTO and manually set the values
            AttendanceCreateResponseDTO attendanceDTO = new AttendanceCreateResponseDTO();
            attendanceDTO.setAttendanceId(attendance.getAttendance_id());
            attendanceDTO.setScheduleId(scheduleId);
            attendanceDTO.setEmployee(mapEmployeeToCreateEmployeeResponseDTO(attendance.getEmployees().get(0)));
            attendanceDTO.setScheduleDate(attendance.getAttendance_date());
            attendanceDTO.setShift(mapShiftToShiftResponseDTO(attendance.getSchedule().getShift()));
            attendanceDTO.setStatus(attendance.getStatus());
            attendanceDTO.setAttendanceType(attendance.getAttendanceType());
            attendanceDTO.setClockIn(attendance.getClock_in());
            attendanceDTO.setClockOut(attendance.getClock_out());
            attendanceDTO.setLocationLatIn(attendance.getLocation_lat_In());
            attendanceDTO.setLocationLongIn(attendance.getLocation_long_In());
            attendanceDTO.setLocationLatOut(attendance.getLocation_lat_Out());
            attendanceDTO.setLocationLongOut(attendance.getLocation_Long_Out());
            attendanceDTO.setSelfieCheckIn(attendance.getSelfieCheckIn());
            attendanceDTO.setSelfieCheckOut(attendance.getSelfieCheckOut());

            scheduleIdDTO.getAttendances().add(attendanceDTO);

            scheduleIdMap.put(scheduleId, scheduleIdDTO);
        }

        return new ArrayList<>(scheduleIdMap.values());
    }


    // To do : tambah by id untuk filter
    @Override
    public List<AttendanceScheduleIdDTO> filterAttendances(AttendanceFilterDTO filterDTO) {
        List<AttendanceModel> filteredAttendances = attendanceRepository.findAll().stream()
                .filter(attendance -> matchesFilter(attendance, filterDTO))
                .collect(Collectors.toList());

        List<AttendanceScheduleIdDTO> result = new ArrayList<>();
        Map<Long, AttendanceScheduleIdDTO> scheduleIdToDtoMap = new HashMap<>();

        for (AttendanceModel attendance : filteredAttendances) {
            Long scheduleId = attendance.getSchedule().getSchedule_id();
            AttendanceScheduleIdDTO dto = scheduleIdToDtoMap.getOrDefault(scheduleId, new AttendanceScheduleIdDTO());
            dto.setScheduleId(scheduleId);

            // Create the AttendanceCreateResponseDTO and manually set the values
            AttendanceCreateResponseDTO attendanceDTO = createAttendanceDTO(attendance);
            dto.getAttendances().add(attendanceDTO);

            scheduleIdToDtoMap.put(scheduleId, dto);
        }

        result.addAll(scheduleIdToDtoMap.values());
        return result;
    }

    private AttendanceCreateResponseDTO createAttendanceDTO(AttendanceModel attendance) {
        AttendanceCreateResponseDTO attendanceDTO = new AttendanceCreateResponseDTO();
        attendanceDTO.setAttendanceId(attendance.getAttendance_id());
        attendanceDTO.setScheduleId(attendance.getSchedule().getSchedule_id());
        attendanceDTO.setEmployee(mapEmployeeToCreateEmployeeResponseDTO(attendance.getEmployees().get(0)));
        attendanceDTO.setScheduleDate(attendance.getAttendance_date());
        attendanceDTO.setShift(mapShiftToShiftResponseDTO(attendance.getSchedule().getShift()));
        attendanceDTO.setStatus(attendance.getStatus());
        attendanceDTO.setAttendanceType(attendance.getAttendanceType());
        attendanceDTO.setClockIn(attendance.getClock_in());
        attendanceDTO.setClockOut(attendance.getClock_out());
        attendanceDTO.setLocationLatIn(attendance.getLocation_lat_In());
        attendanceDTO.setLocationLongIn(attendance.getLocation_long_In());
        attendanceDTO.setLocationLatOut(attendance.getLocation_lat_Out());
        attendanceDTO.setLocationLongOut(attendance.getLocation_Long_Out());
        attendanceDTO.setSelfieCheckIn(attendance.getSelfieCheckIn());
        attendanceDTO.setSelfieCheckOut(attendance.getSelfieCheckOut());
        attendanceDTO.setAttendanceState(attendance.getAttendanceState());
        return attendanceDTO;
    }



    private boolean matchesFilter(AttendanceModel attendance, AttendanceFilterDTO filterDTO) {
        return (filterDTO.getEmployeeName() == null || attendance.getEmployees().stream()
                .anyMatch(employee -> employee.getName().contains(filterDTO.getEmployeeName())))
                && (filterDTO.getEmployeeId() == null || attendance.getEmployees().stream()
                .anyMatch(employee -> employee.getEmployee_id().equals(filterDTO.getEmployeeId())))
                && (filterDTO.getScheduleDate() == null || filterDTO.getScheduleDate().equals(attendance.getSchedule().getSchedule_date()))
                && (filterDTO.getShiftId() == null || filterDTO.getShiftId().equals(attendance.getSchedule().getShift().getShift_id()))
                && (filterDTO.getPlacementName() == null || attendance.getEmployees().stream()
                .anyMatch(employee -> employee.getPlacement().getName().contains(filterDTO.getPlacementName())));
    }





    @Override
    public List<AttendanceQualityResponseDTO> calculateQualityRateByEmployeeAndMonth(Long employeeId, int month) {
        List<AttendanceModel> filteredAttendances = attendanceRepository.findAll().stream()
                .filter(attendance -> matchesFilter(attendance, employeeId, month))
                .collect(Collectors.toList());

        Map<Long, AttendanceQualityResponseDTO> employeeIdToDtoMap = new HashMap<>();

        for (AttendanceModel attendance : filteredAttendances) {
            Long currentEmployeeId = attendance.getEmployees().get(0).getEmployee_id();
            AttendanceQualityResponseDTO dto = employeeIdToDtoMap.getOrDefault(currentEmployeeId, new AttendanceQualityResponseDTO());
            dto.setEmployeeId(currentEmployeeId);
            dto.setEmployeeName(attendance.getEmployees().get(0).getName());
            dto.setMonth(month); // Set the provided month

            // Initialize the attendanceStatusCount and attendanceStateCount maps if they're null
            Map<String, Integer> attendanceStatusCount = dto.getAttendanceStatusCount();
            if (attendanceStatusCount == null) {
                attendanceStatusCount = new HashMap<>();
            }

            Map<String, Integer> attendanceStateCount = dto.getAttendanceStateCount();
            if (attendanceStateCount == null) {
                attendanceStateCount = new HashMap<>();
            }

            // Update the attendance status count
            String status = attendance.getStatus().toString();
            attendanceStatusCount.put(status, attendanceStatusCount.getOrDefault(status, 0) + 1);
            dto.setAttendanceStatusCount(attendanceStatusCount);

            // Update the attendance state count
            AttendanceState attendanceState = attendance.getAttendanceState();
            if (attendanceState != null) {
                String state = attendanceState.toString();
                attendanceStateCount.put(state, attendanceStateCount.getOrDefault(state, 0) + 1);
                dto.setAttendanceStateCount(attendanceStateCount);
            }


            // Calculate quality rate
            double qualityRate = calculateQualityRate(dto);
            dto.setQualityRate(qualityRate);

            employeeIdToDtoMap.put(currentEmployeeId, dto);
        }

        return new ArrayList<>(employeeIdToDtoMap.values());
    }

    private boolean matchesFilter(AttendanceModel attendance, Long employeeId, int month) {
        LocalDate attendanceDate = attendance.getAttendance_date();
        Long currentEmployeeId = attendance.getEmployees().get(0).getEmployee_id();

        return currentEmployeeId.equals(employeeId) && attendanceDate.getMonthValue() == month;
    }

    private double calculateQualityRate(AttendanceQualityResponseDTO dto) {
        // Define constants for weights
        final double ON_TIME_WEIGHT = 1.0;
        final double LATE_WEIGHT = 0.8;
        final double ABSENT_WEIGHT = 0.5;

        Map<String, Integer> attendanceStateCount = dto.getAttendanceStateCount();

        int totalStates = attendanceStateCount.values().stream().mapToInt(Integer::intValue).sum();

        double weightedSum = attendanceStateCount.getOrDefault(AttendanceState.ON_TIME.toString(), 0) * ON_TIME_WEIGHT
                + attendanceStateCount.getOrDefault(AttendanceState.LATE.toString(), 0) * LATE_WEIGHT
                + attendanceStateCount.getOrDefault(AttendanceState.ABSENT.toString(), 0) * ABSENT_WEIGHT;

        if (totalStates == 0) {
            return 0; // Avoid division by zero
        }

        return (weightedSum / totalStates) * 100.0;
    }








}
