using System.ComponentModel.DataAnnotations;

namespace TxApprovalSimulator.API.Dtos;

/// <summary>
/// A simulation request. <see cref="Timestamp"/> is the exact moment the user picked,
/// expressed as an instant with offset (e.g. "2026-06-18T20:00:00+03:00"). The backend
/// converts this instant into the local time of <see cref="Region"/> before checking banking hours.
/// </summary>
public record SubmitTransactionRequest(
    [Required] string Region,
    DateTimeOffset Timestamp);
