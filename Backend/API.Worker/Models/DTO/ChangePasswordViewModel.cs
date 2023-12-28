namespace API.Worker.Models.DTO;

public class ChangePasswordViewModel
{
    public string Email { get; set; }
    public string CurrentPassword { set; get; }
    public string NewPassword { get; set; }
}