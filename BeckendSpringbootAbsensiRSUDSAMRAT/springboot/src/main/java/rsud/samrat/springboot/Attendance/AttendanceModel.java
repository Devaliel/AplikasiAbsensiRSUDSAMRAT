package rsud.samrat.springboot.Attendance;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import rsud.samrat.springboot.Attendance.DTOs.AttendanceType;
import rsud.samrat.springboot.Employee.EmployeeModel;
import rsud.samrat.springboot.Schedule.ScheduleModel;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance")
public class AttendanceModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attendance_id;

    @ManyToOne
    @JoinColumn(name = "schedule_id")
    @JsonBackReference
    private ScheduleModel schedule;

    @ManyToMany
    @JoinTable(
            name = "attendance_employee",
            joinColumns = @JoinColumn(name = "attendance_id"),
            inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    private List<EmployeeModel> employees = new ArrayList<>();
    private LocalDate attendance_date;
    private LocalDateTime clock_in;
    private LocalDateTime clock_out;
    private Double location_lat_In;
    private Double location_long_In;
    private Double Location_lat_Out;
    private Double Location_Long_Out;
    @Lob
    @Column(columnDefinition = "MEDIUMBLOB")
    private byte[] selfieCheckIn;

    @Lob
    @Column(columnDefinition = "MEDIUMBLOB")
    private byte[] selfieCheckOut;

    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;
    @Enumerated(EnumType.STRING)
    private AttendanceType attendanceType;
    @Enumerated(EnumType.STRING)
    private AttendanceState attendanceState;
}
