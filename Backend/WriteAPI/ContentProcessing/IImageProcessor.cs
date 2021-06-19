using SixLabors.ImageSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ContentProcessing
{
    public interface IImageProcessor
    {
        Task<Dictionary<CopyType, ImageStreamWithFormat>> ProcessCopies(Stream stream, params CopyType[] types);
    }
}
