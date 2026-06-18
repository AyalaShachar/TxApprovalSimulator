using System.ComponentModel.DataAnnotations;

namespace TxApprovalSimulator.API.Dtos;

public record SignupRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [Required] string FullName);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);

/// <summary>Returned on successful signup/login: the JWT plus basic profile info.</summary>
public record AuthResponse(string Token, string Email, string FullName);
