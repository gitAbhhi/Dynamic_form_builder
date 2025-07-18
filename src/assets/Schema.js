  // Sample schemas for testing

export const schemas = {
    basic: [
      {
        "title": "Name",
        "name": "name",
        "placeholder": "Enter your name",
        "type": "text",
        "validator": "^[a-zA-Z ]{3,}$",
        "value": "",
        "required": true,
        "error": "Name must be at least 3 letters."
      },
      {
        "title": "Email",
        "name": "email",
        "placeholder": "you@example.com",
        "type": "email",
        "validator": "^[\\w.-]+@[\\w.-]+\\.\\w{2,4}$",
        "required": true,
        "value": "",
        "error": "Invalid email format."
      },
      {
        "title": "Age",
        "name": "age",
        "type": "number",
        "min": "18",
        "max": "99",
        "resolution": "1",
        "required": false,
        "value": "",
        "error": "Age must be between 18 and 99."
      }
    ],
    advanced: [
      {
        "title": "Primary Language",
        "name": "language",
        "type": "select",
        "data": [
          { "id": "js", "title": "JavaScript" },
          { "id": "py", "title": "Python" },
          { "id": "rb", "title": "Ruby" }
        ],
        "required": true,
        "value": "py",
        "error": "Please select a language."
      },
      {
        "title": "Technologies Known",
        "name": "tech_stack",
        "type": "multiselect",
        "data": [
          { "id": "react", "title": "React" },
          { "id": "vue", "title": "Vue" },
          { "id": "flutter", "title": "Flutter" }
        ],
        "required": false,
        "value": ["react"],
        "error": "Select at least one technology."
      },
      {
        "title": "Upload Profile Picture",
        "name": "profile_pic",
        "type": "file",
        "data": {
          "url": "https://upload.example.com/pic",
          "method": "POST",
          "headers": {
            "Authorization": "Bearer sampleToken"
          }
        },
        "required": true,
        "error": "Profile picture is required."
      },
      {
        "title": "Education Details",
        "name": "education",
        "type": "card",
        "data": [
          {
            "title": "Institution",
            "name": "institution",
            "type": "text",
            "validator": "^.{3,}$",
            "required": true,
            "error": "Institution name is required."
          },
          {
            "title": "Start Year",
            "name": "start_year",
            "type": "date",
            "min": "2000-01-01",
            "max": "2025-12-31",
            "resolution": "1",
            "required": true,
            "error": "Enter valid start year."
          }
        ],
        "required": true,
        "error": "All education fields are mandatory."
      }
    ]
  };
