package rsud.samrat.springboot.Employee;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;


public interface EmployeeRepository extends JpaRepository<EmployeeModel,Long> {

    @Query("SELECT e FROM EmployeeModel e WHERE e.nik = :nik ORDER BY e.timestampColumn DESC")
    EmployeeModel findLatestEmployeeByNik(@Param("nik") String nik);


    boolean existsByNik(String nikToCheck);
}
