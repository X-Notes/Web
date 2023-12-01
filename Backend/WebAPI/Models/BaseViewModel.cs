namespace WebAPI.Models;

public class BaseViewModel
{
    public string GcClientId { set; get; }
    
    public string AuthUrl { set; get; }
    
    public string RedirectUrl { set; get; }
    
    public int LanguageId { set; get; }
}