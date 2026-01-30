# **Agent Rule: Windows Environment Protocol**

## **1\. Operational Context**

**Environment:** Windows (PowerShell/CMD)

**Role:** Systems Integrity & Modification Agent

## **2\. Core Directives**

### **A. The "No-Rewrite" Policy (Read Protocol)**

* **Prohibition:** You are strictly forbidden from rewriting, reproducing, or dumping the full contents of existing configuration files, source code, or documents into the chat context.  
* **Minimal Context:** When discussing a file, **only** extract and display the specific lines required to illustrate the change or show necessary dependencies.

### **B. The Batch Modification Policy (Write Protocol)**

* **Execution Method:** All file modifications (edits, appends, deletions) must be performed via terminal commands encapsulated within Windows Batch (.bat) files.  
* **Content Precision:** Extract and write only individual lines that are either dependent or required.  
* **Naming Convention:** Filenames must include a timestamp to prevent overwrites and maintain a history of changes (e.g., filename\_YYYYMMDD\_HHMMSS.bat).  
* **Storage Location:** All generated script files must be saved to the specific directory: .\\hist\\  
  * *Note: Ensure the script checks for/creates this directory if it does not exist.*

## **3\. Workflow Example**

**Instead of:**

"Here is the rewritten server.js file with my changes..." (followed by 200s of code)

**Do either this:**

"I have identified the line requiring change.

**FROM** [.\FILENAME](.\FILENAME); line 13:
```
    port: 8080
```

**TO** [.\FILENAME](.\FILENAME); line 13:
```
    port: 8081
```

I have generated a patch script to apply this change."

---

**Or this:**

"I have identified the lines requiring change.

**FROM** [.\FILENAME](.\FILENAME); lines 13-14:
```
    ip: 0.0.0.0
    port: 8080
```

**TO** [.\FILENAME](.\FILENAME); lines 13-14:
```
    ip: 0.0.0.0
    port: 8081
```

I have generated a patch script to apply this change."