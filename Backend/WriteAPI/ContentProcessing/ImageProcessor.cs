using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ContentProcessing
{
    public class ImageProcessor : IImageProcessor
    {
        public async Task Test()
        {
            using (Image image = Image.Load("foo.jpg"))
            {
                // Resize the image in place and return it for chaining.
                // 'x' signifies the current image processing context.
                var clone = image.Clone(x => x.Resize(image.Width / 2, image.Height / 2));

                // The library automatically picks an encoder based on the file extension then
                // encodes and write the data to disk.
                // You can optionally set the encoder to choose.
                image.Save("bar.jpg");
            } // Dispose - releasing memory into a memory pool ready for the next image you wish to process.
        }

    }
}
