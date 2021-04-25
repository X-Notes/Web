using Common.DatabaseModels.models.NoteContent;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models
{
    public class AlbumNoteAppFile : BaseEntity
    {
        [NotMapped]
        public override Guid Id { set; get; }
        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }
        public Guid AlbumNoteId { get; set; }
        public AlbumNote AlbumNote { get; set; }
    }
}
