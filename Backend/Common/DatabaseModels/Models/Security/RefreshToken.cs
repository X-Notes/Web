using Common.DatabaseModels.Models.Users;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Security;

[Table(nameof(RefreshToken), Schema = SchemeConfig.Security)]
public class RefreshToken : BaseEntity<int>
{
    [NotMapped]
    public override int Id { set; get; }

    public Guid UserId { set; get; }
    public User User { set; get; }

    public string TokenString { get; set; }
    public DateTime ExpireAt { get; set; }

    public bool IsProcessing { set; get; }
}
