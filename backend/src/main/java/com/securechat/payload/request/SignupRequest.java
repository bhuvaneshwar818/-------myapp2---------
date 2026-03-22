package com.securechat.payload.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    private String firstName;
    private String lastName;
    private String phone;
    private String gender;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date dob;
}
