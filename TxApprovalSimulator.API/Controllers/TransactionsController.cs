using Microsoft.AspNetCore.Mvc;
using TxApprovalSimulator.API.Dtos;
using TxApprovalSimulator.API.Services;

namespace TxApprovalSimulator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _service;

    public TransactionsController(ITransactionService service) => _service = service;

    /// <summary>Submit a transaction simulation. Returns the Approved/Rejected result.</summary>
    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Submit([FromBody] SubmitTransactionRequest request)
    {
        var result = await _service.SimulateAsync(request);
        if (result is null)
            return BadRequest($"Unknown region '{request.Region}'.");

        return Ok(result);
    }

    /// <summary>Fetch only the approved transactions (for the bottom cards).</summary>
    [HttpGet("approved")]
    public async Task<ActionResult<IReadOnlyList<TransactionDto>>> GetApproved()
        => Ok(await _service.GetApprovedAsync());
}
