function initializeDatabase() {
    let openRequest = indexedDB.open('CampusNavDB', 1);

    openRequest.onupgradeneeded = function(e) {
        let db = e.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('courses')) {
            db.createObjectStore('courses', {keyPath: 'id', autoIncrement: true});
        }
        if (!db.objectStoreNames.contains('buildings')) {
            db.createObjectStore('buildings', {keyPath: 'id', autoIncrement: true});
        }
        
        // Populate with initial data if needed
        let txn = openRequest.transaction;
        let courseStore = txn.objectStore('courses');
        lesson_db_data.forEach((course, index) => {
            courseStore.put({...course, id: index+1}); // Assuming `lessonData` is available
        });

        let buildingStore = txn.objectStore('buildings');
        db_data.forEach((building, index) => {
            buildingStore.put({...building, id: index+1}); // Assuming `dbData` is available
        });
    };

    openRequest.onerror = function() {
        console.error("Error", openRequest.error);
    };

    openRequest.onsuccess = function() {
        console.log("Database initialized");
    };
}

// This should be called as soon as possible in your application's lifecycle
initializeDatabase();
