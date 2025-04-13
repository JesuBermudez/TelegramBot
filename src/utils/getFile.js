import axios from "axios";
import FormData from "form-data";

export default async function getFile(ctx) {
  const message = ctx.update.message; // message object
  let fileId = ""; // file id

  if (message.document || message.photo) {
    // Check if the message contains a document or photo
    fileId =
      message.document?.file_id ||
      message.photo?.[message.photo.length - 1]?.file_id;
  }

  if (!fileId && message.reply_to_message) {
    const replied = message.reply_to_message;
    if (replied.document || replied.photo) {
      fileId =
        replied.document?.file_id ||
        replied.photo?.[replied.photo.length - 1]?.file_id;
    }
  }

  if (!fileId) return; // No file found

  let fileName =
    message.document?.file_name ||
    message.reply_to_message?.document?.file_name ||
    "File Converted.jpg";

  try {
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const fileUrl = fileLink.href;
    const fileResponse = await axios.get(fileUrl, { responseType: "stream" });
    const form = new FormData();

    form.append("file", fileResponse.data, {
      filename: fileName,
      contentType:
        message.document?.mime_type ||
        message.reply_to_message?.document?.mime_type ||
        "image/jpeg",
    });

    const pdfResponse = await axios.post(process.env.PDF_API, form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer",
    });

    fileName = fileName.split(".").slice(0, -1).concat("pdf").join(".");

    return {
      data: pdfResponse.data,
      fileName: fileName,
    };
  } catch (error) {
    console.log("Error downloading file:", error);
    return;
  }
}
