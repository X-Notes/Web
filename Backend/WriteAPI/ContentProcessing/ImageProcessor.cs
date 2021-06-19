using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Processing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ContentProcessing
{

    public enum CopyType
    {
        Big = 1,
        Medium = 2,
        Min = 3,
        SuperMin = 4,
        Default = 5,
    }

    public class ImageStreamWithFormat
    {
        public byte[] Bytes { set; get; }
        public IImageFormat ImageFormat { set; get; }
        public ImageStreamWithFormat(byte[] Bytes, IImageFormat ImageFormat)
        {
            this.Bytes = Bytes;
            this.ImageFormat = ImageFormat;
        }
    }


    public static class ProcessSettings
    {
        public static int MaxHeight { set; get; } = 1080;
        public static int MaxWidth { set; get; } = 1920;

        public static int MediumHeight { set; get; } = 700;
        public static int MediumWidth { set; get; } = 1120;

        public static int MinHeight { set; get; } = 360;
        public static int MinWidth { set; get; } = 640;

        public static int SuperMinHeight { set; get; } = 124;
        public static int SuperMinWidth { set; get; } = 124;

        public static int GetWidth(CopyType type)
        {
            return type switch
            {
                CopyType.Big => MaxWidth,
                CopyType.Medium => MediumWidth,
                CopyType.Min => MinWidth,
                CopyType.SuperMin => SuperMinWidth,
                _ => throw new ArgumentOutOfRangeException(nameof(type), $"Not expected direction value: {type}")
            };
        }

        public static int GetHeight(CopyType type)
        {
            return type switch
            {
                CopyType.Big => MaxHeight,
                CopyType.Medium => MediumHeight,
                CopyType.Min => MinHeight,
                CopyType.SuperMin => SuperMinHeight,
                _ => throw new ArgumentOutOfRangeException(nameof(type), $"Not expected direction value: {type}")
            };
        }

    }

    public class ImageProcessor : IImageProcessor
    {
        public async Task<ImageStreamWithFormat> GetImageStream(Image copy, IImageFormat format)
        {
            using var ms = new MemoryStream();
            await copy.SaveAsync(ms, format);
            return new ImageStreamWithFormat(ms.ToArray(), format);
        }


        public async Task<Dictionary<CopyType, ImageStreamWithFormat>> ProcessCopies(Stream stream, params CopyType[] types)
        {
            var info = await Image.LoadWithFormatAsync(stream);
            var image = info.Image;
            var format = info.Format;

            var imgDefault = await GetImageStream(image, format);
            var copies = new Dictionary<CopyType, ImageStreamWithFormat>();
            copies.Add(CopyType.Default, imgDefault);


            foreach (var copyType in types)
            {
                var height = ProcessSettings.GetHeight(copyType);
                var width = ProcessSettings.GetWidth(copyType);
                if (image.Height > ProcessSettings.GetHeight(copyType))
                {
                    var coff = (double)height / image.Height;
                    var img = await GetImageStream(image.Clone(x => x.Resize((int)(image.Width * coff), (int)(image.Height * coff))), format);
                    copies.Add(copyType, img);
                }
                else if (image.Width > ProcessSettings.GetWidth(copyType))
                {
                    var coff = (double)width / image.Width;
                    var img = await GetImageStream(image.Clone(x => x.Resize((int)(image.Width * coff), (int)(image.Height * coff))), format);
                    copies.Add(copyType, img);
                }
            }
            return copies;
        }
    }
}
