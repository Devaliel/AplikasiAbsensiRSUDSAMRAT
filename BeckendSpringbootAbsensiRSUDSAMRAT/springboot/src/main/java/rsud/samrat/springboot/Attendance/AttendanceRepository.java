package rsud.samrat.springboot.Attendance;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rsud.samrat.springboot.Employee.EmployeeModel;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceModel,Long>{

    @Query("SELECT a FROM AttendanceModel a WHERE a.attendance_date = :attendanceDate")
    List<AttendanceModel> findAllByAttendanceDate(@Param("attendanceDate") LocalDate attendanceDate);


    @Query("SELECT a FROM AttendanceModel a JOIN a.employees e WHERE a.attendance_date = :attendanceDate AND e.employee_id = :employeeId")
    List<AttendanceModel> findAllByAttendanceDateAndEmployeeId(@Param("attendanceDate") LocalDate attendanceDate, @Param("employeeId") Long employeeId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM AttendanceModel a WHERE :employee MEMBER OF a.employees AND a.attendance_date = :attendanceDate")
    boolean existsByEmployeesContainsAndAttendanceDate(EmployeeModel employee, LocalDate attendanceDate);


    @Query("SELECT a FROM AttendanceModel a WHERE a.attendance_date BETWEEN :startDate AND :endDate")
    Page<AttendanceModel> findAllByAttendanceDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);
}
