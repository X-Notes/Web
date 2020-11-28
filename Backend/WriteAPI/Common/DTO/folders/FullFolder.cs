using Common.DatabaseModels.helpers;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.folders
{
    public class FullFolder
    {
        public string Id { get; set; }
        public string Title { set; get; }
        public string Color { set; get; }
        public FoldersType FolderType { set; get; }
        public RefType RefType { set; get; }
    }
}
