using Microsoft.AspNetCore.Mvc;
using TxApprovalSimulator.API.Services;

namespace TxApprovalSimulator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegionsController : ControllerBase
{
    /// <summary>The list of supported regions, used to populate the dropdown.</summary>
    [HttpGet]
    public ActionResult<IReadOnlyCollection<string>> Get() => Ok(RegionTimeZones.Regions);
}
