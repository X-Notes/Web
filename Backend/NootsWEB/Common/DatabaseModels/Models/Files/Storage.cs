using Common.DatabaseModels.Models.Files.Models;
using Common.DatabaseModels.Models.Users;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Files;

[Table(nameof(Storage), Schema = SchemeConfig.File)]
public class Storage : BaseEntity<StoragesEnum>
{
    public string Name { set; get; }

    public List<AppFile> AppFiles { set; get; }

    public List<User> Users { set; get; }

}
