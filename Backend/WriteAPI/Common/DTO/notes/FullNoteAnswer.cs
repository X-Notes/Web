using Common.DatabaseModels.helpers;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.notes
{
    public class FullNoteAnswer
    {
        public bool CanView { set; get; }
        public RefType? AccessType { set; get; }
        public FullNote FullNote { set; get; }
    }
}
