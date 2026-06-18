namespace TxApprovalSimulator.API.Services;

/// <summary>
/// Maps a region (country) to its IANA time zone id. .NET 6+ resolves IANA ids
/// cross-platform (including Windows) via ICU, so the same code works everywhere.
/// </summary>
public static class RegionTimeZones
{
    private static readonly IReadOnlyDictionary<string, string> Map =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["France"] = "Europe/Paris",
            ["Israel"] = "Asia/Jerusalem",
            ["Cyprus"] = "Asia/Nicosia",
            ["Italy"]  = "Europe/Rome",
            ["USA"]    = "America/New_York",
            ["Japan"]  = "Asia/Tokyo",
        };

    public static IReadOnlyCollection<string> Regions { get; } = Map.Keys.ToArray();

    public static bool TryGetTimeZone(string? region, out TimeZoneInfo timeZone)
    {
        timeZone = TimeZoneInfo.Utc;
        if (region is null || !Map.TryGetValue(region, out var ianaId))
            return false;

        timeZone = TimeZoneInfo.FindSystemTimeZoneById(ianaId);
        return true;
    }
}
