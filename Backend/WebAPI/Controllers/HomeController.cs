using System.Diagnostics;
using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using WebAPI.Models;

namespace WebAPI.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly AuthRequestOptions _authOptions;
    private readonly GoogleAuthClient _gOptions;

    public HomeController(
        ILogger<HomeController> logger, 
        IOptions<GoogleAuthClient> gOptions,
        IOptions<AuthRequestOptions> authOptions)
    {
        _logger = logger;
        _authOptions = authOptions.Value;
        _gOptions = gOptions.Value;
    }


    public IActionResult Index()
    {
        return View(new BaseViewModel
        {
            GcClientId = _gOptions.Id,
            AuthUrl = _authOptions.Url,
            LanguageId = (int)LanguageHelper.GetLanguageEnumFromCultureInfo(CultureInfo.CurrentCulture),
            RedirectUrl =  _authOptions.RedirectUrl
        });
    }
    
    [Route("About")]
    public IActionResult About()
    {
        return View("~/Views/Home/Index.cshtml", new BaseViewModel
        {
            GcClientId = _gOptions.Id,
            AuthUrl = _authOptions.Url,
            LanguageId = (int)LanguageHelper.GetLanguageEnumFromCultureInfo(CultureInfo.CurrentCulture),
            RedirectUrl =  _authOptions.RedirectUrl
        });
    }
    
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}