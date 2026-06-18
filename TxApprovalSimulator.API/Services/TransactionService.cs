using Microsoft.EntityFrameworkCore;
using TxApprovalSimulator.API.Data;
using TxApprovalSimulator.API.Dtos;
using TxApprovalSimulator.API.Models;

namespace TxApprovalSimulator.API.Services;

public class TransactionService : ITransactionService
{
    // Standard banking hours: 08:00 (inclusive) .. 18:00 (exclusive).
    private static readonly TimeOnly OpeningTime = new(8, 0);
    private static readonly TimeOnly ClosingTime = new(18, 0);

    private readonly AppDbContext _db;

    public TransactionService(AppDbContext db) => _db = db;

    public async Task<TransactionDto?> SimulateAsync(SubmitTransactionRequest request)
    {
        if (!RegionTimeZones.TryGetTimeZone(request.Region, out var timeZone))
            return null;

        // The core of the task: take the exact instant the user submitted and find out
        // what the wall-clock time was in the selected region at that moment (DST-aware).
        var localDateTime = TimeZoneInfo.ConvertTime(request.Timestamp, timeZone);
        var localTime = TimeOnly.FromTimeSpan(localDateTime.TimeOfDay);

        var isApproved = localTime >= OpeningTime && localTime < ClosingTime;

        var transaction = new Transaction
        {
            Region = request.Region,
            SubmittedAt = request.Timestamp,
            LocalTime = localTime,
            Status = isApproved ? TransactionStatus.Approved : TransactionStatus.Rejected,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();

        return ToDto(transaction);
    }

    public async Task<IReadOnlyList<TransactionDto>> GetApprovedAsync()
    {
        var approved = await _db.Transactions
            .Where(t => t.Status == TransactionStatus.Approved)
            .OrderByDescending(t => t.CreatedAtUtc)
            .ToListAsync();

        return approved.Select(ToDto).ToList();
    }

    private static TransactionDto ToDto(Transaction t) =>
        new(t.Id, t.Region, t.LocalTime.ToString("HH:mm"), t.Status.ToString());
}
