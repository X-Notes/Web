using System.ComponentModel.DataAnnotations;
using Common.CQRS;
using Common.DatabaseModels.Models.Folders;
using Common.DTO.Folders;
using Common.DTO.Personalization;
using MediatR;

namespace Noots.Folders.Queries
{
    public class GetFoldersByTypeQuery : BaseQueryEntity, IRequest<List<SmallFolder>>

    {
        [Required]
        public FolderTypeENUM TypeId { set; get; }

        [Required]
        public PersonalizationSettingDTO Settings { set; get; }

        public GetFoldersByTypeQuery(Guid userId, FolderTypeENUM id, PersonalizationSettingDTO settings) :base(userId)
        {
            this.TypeId = id;
            this.Settings = settings;
        }
    }
}
