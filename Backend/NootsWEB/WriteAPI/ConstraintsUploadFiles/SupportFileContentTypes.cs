using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WriteAPI.ConstraintsUploadFiles
{
    public static class SupportFileContentTypes
    {

        public static List<string> Photos { get; set; } = new List<string>() {
            "image/png",   // .png
            "image/jpeg"  // .jpeg
        };


        public static List<string> Videos { get; set; } = new List<string>() {
            "video/mp4"    // .mp4
        };


        public static List<string> Audios { get; set; } = new List<string>() {
            "audio/mpeg",  // .mp3
            "audio/wav",   // .wav
            "audio/ogg",   // .ogg
            "video/ogg"    // .ogg firefox
        };


        public static List<string> Documents { get; set; } = new List<string>() {
            "application/pdf",      // .pdf

            "application/msword",   // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx

            "application/rtf",      // .rtf

            "text/plain",           // .txt

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel", // .xls
            "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
            "application/vnd.ms-excel.sheet.binary.macroEnabled.12", // .xlsb

            "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
            "application/vnd.ms-powerpoint", // .ppt
            "application/vnd.ms-powerpoint.presentation.macroEnabled.12", // .pptm
            "application/vnd.ms-powerpoint.slideshow.macroEnabled.12", // .ppsm
            "application/vnd.openxmlformats-officedocument.presentationml.slideshow", // .ppsx
            
            "application/octet-stream"
        };

        public static bool IsFileSupport(string mimiType)
        {
            return Photos.Contains(mimiType) || Videos.Contains(mimiType) || Audios.Contains(mimiType) || Documents.Contains(mimiType);
        }

        public static bool IsFileSupport(List<string> types)
        {
            return types.Any(x => IsFileSupport(x));
        }
    }
}
