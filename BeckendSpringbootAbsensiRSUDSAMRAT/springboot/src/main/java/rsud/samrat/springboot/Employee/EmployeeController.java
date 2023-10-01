package rsud.samrat.springboot.Employee;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rsud.samrat.springboot.Employee.DTOs.AddEmployeeToScheduleRequestDTO;
import rsud.samrat.springboot.Employee.DTOs.CreateEmployeeRequestDTO;
import rsud.samrat.springboot.Employee.DTOs.CreateEmployeeResponseDTO;
import rsud.samrat.springboot.Employee.DTOs.GetAllEmployeeResponseDTO;
import rsud.samrat.springboot.Schedule.DTOs.ScheduleResponseDTO;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dev/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    public ResponseEntity<CreateEmployeeResponseDTO> createEmployee(@RequestBody CreateEmployeeRequestDTO createEmployeeRequestDTO) {
        CreateEmployeeResponseDTO createdEmployee = employeeService.createEmployee(createEmployeeRequestDTO);
        return new ResponseEntity<>(createdEmployee, HttpStatus.CREATED);
    }

    @PostMapping("/creates")
    public List<CreateEmployeeResponseDTO> createEmployees(@RequestBody List<CreateEmployeeRequestDTO> createEmployeeRequestDTOs) {
        // Call the service to create employees
        List<CreateEmployeeResponseDTO> responseDTOs = employeeService.createEmployees(createEmployeeRequestDTOs);
        return responseDTOs;
    }

    @GetMapping
    public ResponseEntity<List<GetAllEmployeeResponseDTO>> getAllEmployees() {
        List<GetAllEmployeeResponseDTO> employees = employeeService.getAllEmployees();
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @PostMapping("/{employeeId}/schedule")
    public ResponseEntity<ScheduleResponseDTO> addEmployeeToSchedule(@PathVariable Long employeeId, @RequestBody AddEmployeeToScheduleRequestDTO requestDTO) {
        requestDTO.setEmployeeId(employeeId);
        ScheduleResponseDTO responseDTO = employeeService.addEmployeeToSchedule(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{employeeId}")
    public ResponseEntity<CreateEmployeeResponseDTO> updateEmployee(@PathVariable Long employeeId, @RequestBody CreateEmployeeRequestDTO updateEmployeeRequestDTO) {
        CreateEmployeeResponseDTO responseDTO = employeeService.updateEmployee(employeeId, updateEmployeeRequestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.OK);
    }

    @GetMapping("/nik/{nik}")
    public ResponseEntity<CreateEmployeeResponseDTO> getEmployeeByNIK(@PathVariable String nik) {
        CreateEmployeeResponseDTO employeeDTO = employeeService.getLatestEmployeeByNIK(nik);
        if (employeeDTO != null) {
            return ResponseEntity.ok(employeeDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countTotalEmployees() {
        long totalEmployees = employeeService.countTotalEmployees();
        return ResponseEntity.ok(totalEmployees);
    }

}

