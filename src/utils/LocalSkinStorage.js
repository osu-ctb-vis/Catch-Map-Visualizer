const DB_NAME = "local-skins";
const DB_VERSION = 1;
const STORE_NAME = "skins";

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (event.oldVersion < 1) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };
        
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export async function saveLocalSkin(skin, id) {
	// preprocess skin, to convert blob urls to base64
	for (const key in skin) {
		const value = skin[key];
		console.log("key", key, "value", value);
		if (typeof(value) == "string" && value.startsWith("blob:")) {
			const blob = await fetch(value).then(res => res.blob());
			const base64 = await (new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					resolve(e.target.result);
				}
				reader.onerror = (e) => {
					reject(e);
				}
				reader.readAsDataURL(blob);
			}
			));
			skin[key] = base64;
		}
	}

    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id, skin });

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export async function getAllLocalSkins() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.getAll();
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export async function getLocalSkin(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
      
        const request = store.get(id);
        request.onsuccess = async (event) => {
            const skin = event.target.result && event.target.result.skin;
			if (!skin) {
				resolve(null);
			}
			// preprocess skin, to convert base64 to blob urls
			for (const key in skin) {
				const value = skin[key];
				if (typeof(value) == "string" && value.startsWith("data:")) {
					const base64 = value;
					const blob = await fetch(base64).then(res => res.blob());
					const blobUrl = URL.createObjectURL(blob);
					skin[key] = blobUrl;
				}
			}
			resolve(skin);
        };
      
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export async function deleteLocalSkin(id) {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);
	  
		const request = store.delete(id);
		request.onsuccess = () => {
			resolve();
		};
	  
		request.onerror = (event) => {
			reject(event.target.error);
		};
	});
}