export function fetchDataUrl(url: string): Promise<string> {
  return fetch(url)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to read image as data URL"));
          }
        };

        reader.onerror = () => {
          reject(reader.error ?? new Error("Failed to read image as data URL"));
        };

        reader.readAsDataURL(blob);
      });
    });
}

