namespace TxApprovalSimulator.API.Dtos;

/// <summary>What the client needs to render a result / an approved-transaction card.</summary>
public record TransactionDto(
    int Id,
    string Region,
    string LocalTime,   // "HH:mm" — the local time in the region
    string Status);     // "Approved" / "Rejected"
