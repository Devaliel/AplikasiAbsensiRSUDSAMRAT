package rsud.samrat.springboot.Employee;

import rsud.samrat.springboot.Employee.DTOs.CreateEmployeeRequestDTO;
import rsud.samrat.springboot.Employee.DTOs.CreateEmployeeResponseDTO;
import rsud.samrat.springboot.Employee.DTOs.GetAllEmployeeResponseDTO;

import java.util.List;

public interface EmployeeService {
    CreateEmployeeResponseDTO createEmployee(CreateEmployeeRequestDTO createEmployeeRequestDTO);
    List<GetAllEmployeeResponseDTO> getAllEmployees();
}

