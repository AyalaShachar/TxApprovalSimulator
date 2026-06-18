using TxApprovalSimulator.API.Dtos;

namespace TxApprovalSimulator.API.Services;

public interface ITransactionService
{
    /// <summary>
    /// Runs the simulation: converts the submitted instant to the region's local time,
    /// decides Approved/Rejected by the banking-hours rule, persists it, and returns the result.
    /// Returns null if the region is not recognized.
    /// </summary>
    Task<TransactionDto?> SimulateAsync(SubmitTransactionRequest request);

    /// <summary>Returns only the approved transactions, newest first.</summary>
    Task<IReadOnlyList<TransactionDto>> GetApprovedAsync();
}
