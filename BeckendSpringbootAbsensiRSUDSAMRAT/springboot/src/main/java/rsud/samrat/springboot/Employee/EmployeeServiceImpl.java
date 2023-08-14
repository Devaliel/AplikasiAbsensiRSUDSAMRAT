package rsud.samrat.springboot.Employee;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rsud.samrat.springboot.Attendance.AttendanceModel;
import rsud.samrat.springboot.Attendance.AttendanceRepository;
import rsud.samrat.springboot.Employee.DTOs.AddEmployeeToScheduleRequestDTO;
import rsud.samrat.springboot.Employee.DTOs.CreateEmployeeRequestDTO;
import rsud.samrat.springboot.Employee.DTOs.CreateEmployeeResponseDTO;
import rsud.samrat.springboot.Employee.DTOs.GetAllEmployeeResponseDTO;
import rsud.samrat.springboot.Exception.NotFoundException;
import rsud.samrat.springboot.Locations.DTOs.LocationsCreateResponseDTO;
import rsud.samrat.springboot.Locations.LocationModel;
import rsud.samrat.springboot.Placement.DTOs.PlacementCreateResponseDTO;
import rsud.samrat.springboot.Placement.PlacementModel;
import rsud.samrat.springboot.Placement.PlacementRepository;
import rsud.samrat.springboot.Schedule.DTOs.ScheduleResponseDTO;
import rsud.samrat.springboot.Schedule.ScheduleModel;
import rsud.samrat.springboot.Schedule.ScheduleRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PlacementRepository placementRepository;
    private final ScheduleRepository scheduleRepository;
    private final AttendanceRepository attendanceRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public EmployeeServiceImpl(EmployeeRepository employeeRepository, PlacementRepository placementRepository, ScheduleRepository scheduleRepository, AttendanceRepository attendanceRepository, ModelMapper modelMapper) {
        this.employeeRepository = employeeRepository;
        this.placementRepository = placementRepository;
        this.scheduleRepository = scheduleRepository;
        this.attendanceRepository = attendanceRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public CreateEmployeeResponseDTO createEmployee(CreateEmployeeRequestDTO createEmployeeRequestDTO) {
        EmployeeModel employee = modelMapper.map(createEmployeeRequestDTO, EmployeeModel.class);

        PlacementModel placement = placementRepository.findById(createEmployeeRequestDTO.getPlacementId())
                .orElseThrow(() -> new NotFoundException("Placement not found with id: " + createEmployeeRequestDTO.getPlacementId()));

        employee.setPlacement(placement);
        EmployeeModel savedEmployee = employeeRepository.save(employee);
        PlacementCreateResponseDTO placementResponseDTO = modelMapper.map(placement, PlacementCreateResponseDTO.class);
        CreateEmployeeResponseDTO responseDTO = modelMapper.map(savedEmployee, CreateEmployeeResponseDTO.class);
        responseDTO.setPlacement(placementResponseDTO);
        responseDTO.setEmployeeId(savedEmployee.getEmployee_id());

        return responseDTO;
    }

    // EmployeeServiceImpl.java
    @Override
    public List<GetAllEmployeeResponseDTO> getAllEmployees() {
        List<EmployeeModel> employees = employeeRepository.findAll();

        return employees.stream()
                .map(employee -> {
                    GetAllEmployeeResponseDTO responseDTO = modelMapper.map(employee, GetAllEmployeeResponseDTO.class);
                    responseDTO.setEmployeeId(employee.getEmployee_id());
                    PlacementCreateResponseDTO placementResponseDTO = modelMapper.map(employee.getPlacement(), PlacementCreateResponseDTO.class);
                    responseDTO.setPlacement(placementResponseDTO);
                    return responseDTO;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ScheduleResponseDTO addEmployeeToSchedule(AddEmployeeToScheduleRequestDTO requestDTO) {
        Long employeeId = requestDTO.getEmployeeId();
        Long scheduleId = requestDTO.getScheduleId();

        EmployeeModel employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found with id: " + employeeId));

        ScheduleModel schedule = scheduleRepository.findByIdWithEmployeesAndLocation(scheduleId)
                .orElseThrow(() -> new NotFoundException("Schedule not found with id: " + scheduleId));

        schedule.getEmployees().add(employee);
        ScheduleModel updatedSchedule = scheduleRepository.save(schedule);

        // Manually map the LocationModel to LocationResponseDTO
        LocationsCreateResponseDTO locationResponseDTO = null;
        LocationModel location = updatedSchedule.getLocation();
        if (location != null) {
            locationResponseDTO = new LocationsCreateResponseDTO();
            locationResponseDTO.setLocationId(location.getLocationId());
            locationResponseDTO.setLocationName(location.getLocationName());
            locationResponseDTO.setLatitude(location.getLatitude());
            locationResponseDTO.setLongitude(location.getLongitude());
        }

        ScheduleResponseDTO responseDTO = modelMapper.map(updatedSchedule, ScheduleResponseDTO.class);


        responseDTO.setLocation(locationResponseDTO);

        return responseDTO;
    }

    @Override
    public CreateEmployeeResponseDTO updateEmployee(Long employeeId, CreateEmployeeRequestDTO updateEmployeeRequestDTO) {
        EmployeeModel employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found with id: " + employeeId));

        // Update the employee details from the request DTO
        employee.setName(updateEmployeeRequestDTO.getName());
        employee.setRole(updateEmployeeRequestDTO.getRole());

        // Fetch the related placement and update it if provided in the request DTO
        if (updateEmployeeRequestDTO.getPlacementId() != null) {
            PlacementModel placement = placementRepository.findById(updateEmployeeRequestDTO.getPlacementId())
                    .orElseThrow(() -> new NotFoundException("Placement not found with id: " + updateEmployeeRequestDTO.getPlacementId()));
            employee.setPlacement(placement);
        }

        // Save the updated employee in the database
        EmployeeModel updatedEmployee = employeeRepository.save(employee);


        CreateEmployeeResponseDTO responseDTO = modelMapper.map(updatedEmployee, CreateEmployeeResponseDTO.class);
        responseDTO.setEmployeeId(updatedEmployee.getEmployee_id());
        PlacementCreateResponseDTO placementResponseDTO = modelMapper.map(updatedEmployee.getPlacement(), PlacementCreateResponseDTO.class);
        responseDTO.setPlacement(placementResponseDTO);

        return responseDTO;
    }

/**
    public void deleteEmployee(Long employeeId) {
        EmployeeModel employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new NotFoundException("Employee not found with id: " + employeeId));

        // Remove the employee from all schedules
        List<ScheduleModel> schedules = employee.getSchedules();
        for (ScheduleModel schedule : schedules) {
            schedule.getEmployees().remove(employee);
            scheduleRepository.save(schedule);
        }

        // Remove the employee from all attendance records
        List<AttendanceModel> attendanceList = employee.getAttendanceList(); // Assuming you have this list in EmployeeModel
        for (AttendanceModel attendance : attendanceList) {
            attendance.getEmployees().remove(employee);
            attendanceRepository.save(attendance);
        }

        // Clear the attendance records for the employee (optional)
        attendanceList.clear();

        // Delete the employee
        employeeRepository.delete(employee);
    }
**/



}
