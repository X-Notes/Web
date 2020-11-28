using Common.DatabaseModels.helpers;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.folders
{
    public class FullFolderAnswer
    {
        public bool CanView { set; get; }
        public RefType? AccessType { set; get; }
        public FullFolder FullFolder { set; get; }
    }
}
