const apiKey = "7cb30a1b7d0c405c27909f2f5fa515de";
export async function uploadImgBBMultipleFile(files: File[] | FileList) {
    // Chuyển đổi FileList hoặc bất kỳ đối tượng tương tự mảng nào thành mảng thực sự
    const filesArray = Array.isArray(files) ? files : Array.from(files);
    
    const uploadPromises = filesArray.map((file) => {
      console.log("File in imgbb.jsx",file);
      const formData = new FormData();
      formData.append("image", file);
  
      return fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json()) 
        .then((data) => data.data.url)
        .catch((error) => {
          console.log("Upload error:", error);
          return null;
        });
    });
  
    return Promise.all(uploadPromises);
  }

  export async function uploadImgBBOneFile(file: File){
    const formData = new FormData();
    formData.append("image", file); // Truyền file trực tiếp
  
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error("Failed to upload image");
    }
  
    const data = await response.json();
    return data.data.url; // Trả về link ảnh dưới dạng chuỗi string
  };
  