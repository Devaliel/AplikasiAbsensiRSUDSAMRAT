package rsud.samrat.springboot.Employee;

import rsud.samrat.springboot.Employee.DTOs.AddEmployeeToScheduleRequestDTO;
import rsud.samrat.springboot.Employee.DTOs.CreateEmployeeRequestDTO;
import rsud.samrat.springboot.Employee.DTOs.CreateEmployeeResponseDTO;
import rsud.samrat.springboot.Employee.DTOs.GetAllEmployeeResponseDTO;
import rsud.samrat.springboot.Schedule.DTOs.ScheduleResponseDTO;

import java.util.List;

public interface EmployeeService {
    CreateEmployeeResponseDTO createEmployee(CreateEmployeeRequestDTO createEmployeeRequestDTO);
    List<CreateEmployeeResponseDTO> createEmployees(List<CreateEmployeeRequestDTO> createEmployeeRequestDTOs);
    List<GetAllEmployeeResponseDTO> getAllEmployees();
    ScheduleResponseDTO addEmployeeToSchedule(AddEmployeeToScheduleRequestDTO requestDTO);
    CreateEmployeeResponseDTO updateEmployee(Long employeeId, CreateEmployeeRequestDTO updateEmployeeRequestDTO);
    CreateEmployeeResponseDTO getLatestEmployeeByNIK(String nik);

    long countTotalEmployees();



}

