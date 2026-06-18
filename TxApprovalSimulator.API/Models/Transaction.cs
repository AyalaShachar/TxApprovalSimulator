namespace TxApprovalSimulator.API.Models;

public class Transaction
{
    public int Id { get; set; }

    /// <summary>The region (country) the user selected, e.g. "France".</summary>
    public string Region { get; set; } = string.Empty;

    /// <summary>The exact moment the user submitted, as an unambiguous instant (carries its UTC offset).</summary>
    public DateTimeOffset SubmittedAt { get; set; }

    /// <summary>The wall-clock time in the selected region at that exact moment.</summary>
    public TimeOnly LocalTime { get; set; }

    public TransactionStatus Status { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
