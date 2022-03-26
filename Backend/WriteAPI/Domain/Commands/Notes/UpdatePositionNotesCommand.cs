using Common.DatabaseModels.Models.Notes;
using Common.DTO.Notes;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.Notes
{
    public class UpdatePositionNotesCommand
    {
        public List<NotePositionDTO> Positions { set; get; }

    }
}
