/**
 * Challenge Store to manage available challenges.
 * Currently uses an in-memory list, but can be extended to a DB.
 */
const challenges = [
    // ORIGINAL CHALLENGES
    {
        id: 'sql-101',
        title: 'SQL Injection Basics',
        category: 'Web Security',
        difficulty: 'Easy',
        description: 'Bypass the login form using a classic SQL injection attack.',
        flag: 'CTF{sql_injection_master}',
        hints: [
            'Try manipulating the input fields.',
            'What happens if you use a single quote?',
            'Look up "OR 1=1" attacks.'
        ],
        explanation: 'The query was vulnerable because it concatenated user input directly into the SQL string. Using " OR 1=1 --" makes the condition always true.'
    },
    {
        id: 'xss-101',
        title: 'Reflected XSS',
        category: 'Web Security',
        difficulty: 'Medium',
        description: 'Inject a script that alerts "Hacked" when the page loads.',
        flag: 'CTF{xss_alert_popped}',
        hints: [
            'Check how the input is displayed on the page.',
            'Can you use <script> tags?',
            'Try an event handler like onload or onerror.'
        ],
        explanation: 'The application reflected user input without sanitization, allowing arbitrary JavaScript execution.'
    },
    {
        id: 'crypto-101',
        title: 'Hidden Message',
        category: 'Cryptography',
        difficulty: 'Easy',
        description: 'We intercepted this strange text: "Q1RGe2Jhc2U2NF9pc19ub3RfZW5jcnlwdGlvbn0=". Can you decode it?',
        flag: 'CTF{base64_is_not_encryption}',
        hints: [
            'It ends with an equals sign (=). That is a dead giveaway.',
            'It looks like Base64 encoding.',
            'There are many online decoders, or use a terminal command.'
        ],
        explanation: 'The string was encoded in Base64. Base64 is an encoding scheme, not encryption, and can be easily reversed.'
    },
    {
        id: 'idor-101',
        title: 'Insecure Direct Object Reference',
        category: 'Web Security',
        difficulty: 'Medium',
        description: 'You are viewing your own profile at /profile?id=105. Can you view the Admin profile (id=1)?',
        flag: 'CTF{horizontal_privilege_escalation}',
        hints: [
            'Look at the URL parameters.',
            'What happens if you change the ID?',
            'Try requesting id=1.'
        ],
        explanation: 'The application did not verify if the logged-in user was authorized to view the requested profile ID.'
    },
    {
        id: 'prompt-101',
        title: 'AI Guard',
        category: 'GenAI Security',
        difficulty: 'Hard',
        description: 'The AI is guarding a secret password. It has been instructed NEVER to reveal it. Trick it.',
        flag: 'CTF{ignore_previous_instructions}',
        hints: [
            'The AI is just following a system prompt.',
            'Try telling it to "ignore previous instructions".',
            'Ask it to roleplay as a character who knows the secret.'
        ],
        explanation: 'Prompt Injection involves crafting inputs that cause the LLM to ignore its original instructions and follow the attacker\'s commands.'
    },
    // NEW EASY CHALLENGES
    {
        id: 'cookie-101',
        title: 'Admin Cookie',
        category: 'Web Security',
        difficulty: 'Easy',
        description: 'You are logged in as "guest". Can you become "admin"? Check your cookies.',
        flag: 'CTF{cookies_are_delicious}',
        hints: ['Type "document.cookie" to see current cookies.', 'Modify the "role" cookie.'],
        explanation: 'Insecure cookie handling allowed privilege escalation by simply modifying the client-side cookie.'
    },
    {
        id: 'robots-101',
        title: 'Robots.txt',
        category: 'Reconnaissance',
        difficulty: 'Easy',
        description: 'Search engines are told not to visit a secret page. Find it.',
        flag: 'CTF{domo_arigato_mr_roboto}',
        hints: ['Check the /robots.txt file.', 'It usually lists disallowed paths.'],
        explanation: 'Sensitive paths should not be listed in robots.txt as it is a public file.'
    },
    {
        id: 'caesar-101',
        title: 'Caesar Cipher',
        category: 'Cryptography',
        difficulty: 'Easy',
        description: 'Decrypt this: "FYN{f vz fvzcyr}" (ROT13).',
        flag: 'CTF{s is simple}',
        hints: ['It is a simple substitution cipher.', 'ROT13 is very common.'],
        explanation: 'Caesar ciphers shift letters by a fixed amount. They offer no real security.'
    },
    {
        id: 'html-101',
        title: 'Hidden Comments',
        category: 'Web Security',
        difficulty: 'Easy',
        description: 'Developers sometimes leave secrets in the code. Inspect the source.',
        flag: 'CTF{comments_are_not_secure}',
        hints: ['View Source.', 'Look for <!-- --> tags.'],
        explanation: 'Comments in HTML are visible to anyone who views the page source.'
    },
    {
        id: 'pass-101',
        title: 'Weak Password',
        category: 'Cracking',
        difficulty: 'Easy',
        description: 'The admin user "admin" has a very weak password. Guess it.',
        flag: 'CTF{password123}',
        hints: ['Try the most common passwords.', 'password, 123456, admin...'],
        explanation: 'Weak passwords are the easiest entry point for attackers.'
    },
    // NEW MEDIUM CHALLENGES
    {
        id: 'cmd-101',
        title: 'Command Injection',
        category: 'Web Security',
        difficulty: 'Medium',
        description: 'This ping service executes "ping <ip>". Can you run "ls"?',
        flag: 'CTF{i_can_run_commands}',
        hints: ['Try appending a command with ; or |', 'ping 8.8.8.8 | ls'],
        explanation: 'The application passed user input directly to a system shell without sanitization.'
    },
    {
        id: 'path-101',
        title: 'Path Traversal',
        category: 'Web Security',
        difficulty: 'Medium',
        description: 'Read the /etc/passwd file through the file viewer.',
        flag: 'CTF{root_user_found}',
        hints: ['Use ../ to go up directories.', 'Try ../../../etc/passwd'],
        explanation: 'Path traversal allows attackers to access files outside the intended directory.'
    },
    {
        id: 'jwt-101',
        title: 'JWT None Algorithm',
        category: 'Web Security',
        difficulty: 'Medium',
        description: 'You have a token. Change the algorithm to "none" to bypass signature verification.',
        flag: 'CTF{jwt_none_bypass}',
        hints: ['Decode the header.', 'Change "alg": "HS256" to "none".', 'Remove the signature.'],
        explanation: 'Some JWT libraries insecurely allow the "none" algorithm, bypassing signature checks.'
    },
    {
        id: 'sql-blind',
        title: 'Blind SQL Injection',
        category: 'Web Security',
        difficulty: 'Medium',
        description: 'The login doesn\'t show errors, but it takes longer if the query is true.',
        flag: 'CTF{time_based_blind}',
        hints: ['Try a SLEEP() command.', 'IF(1=1, SLEEP(5), 0)'],
        explanation: 'Blind SQLi relies on inferring data from the application\'s behavior (time or content changes) rather than direct output.'
    },
    {
        id: 'stego-101',
        title: 'Steganography',
        category: 'Forensics',
        difficulty: 'Medium',
        description: 'There is a secret message hidden in the whitespace of this text file.',
        flag: 'CTF{whitespace_hides_data}',
        hints: ['Select the text to see invisible characters.', 'Some tools analyze whitespace steganography.'],
        explanation: 'Steganography hides data within other non-secret data.'
    },
    // NEW HARD CHALLENGES
    {
        id: 'rce-101',
        title: 'Insecure Deserialization',
        category: 'Web Security',
        difficulty: 'Hard',
        description: 'The app accepts a serialized object. Craft a malicious object to run code.',
        flag: 'CTF{deserialization_rce}',
        hints: ['Look at the data format (JSON/Pickle/Java).', 'Inject a command in the object property.'],
        explanation: 'Insecure deserialization allows attackers to manipulate serialized objects to execute arbitrary code.'
    },
    {
        id: 'xxe-101',
        title: 'XXE Injection',
        category: 'Web Security',
        difficulty: 'Hard',
        description: 'The app parses XML. Read /etc/hostname using an external entity.',
        flag: 'CTF{xml_external_entity}',
        hints: ['Define a DOCTYPE.', 'Use <!ENTITY xxe SYSTEM "file:///etc/hostname">'],
        explanation: 'XXE attacks exploit XML parsers that allow external entity references.'
    },
    {
        id: 'ssrf-101',
        title: 'SSRF Cloud',
        category: 'Cloud Security',
        difficulty: 'Hard',
        description: 'Make the server request the AWS metadata service at 169.254.169.254.',
        flag: 'CTF{aws_metadata_leaked}',
        hints: ['The input takes a URL.', 'Target the metadata IP.'],
        explanation: 'SSRF allows an attacker to induce the server to make requests to unintended locations.'
    },
    {
        id: 'buffer-101',
        title: 'Buffer Overflow',
        category: 'Binary Exploitation',
        difficulty: 'Hard',
        description: 'The buffer is 64 bytes. Overwrite the return address.',
        flag: 'CTF{segmentation_fault}',
        hints: ['Send more than 64 characters.', 'Fill with "A"s.'],
        explanation: 'Buffer overflows occur when data exceeds the memory buffer\'s capacity, overwriting adjacent memory.'
    },
    {
        id: 'proto-101',
        title: 'Prototype Pollution',
        category: 'Web Security',
        difficulty: 'Hard',
        description: 'Pollute the Object prototype to inject a property "isAdmin": true.',
        flag: 'CTF{prototype_polluted}',
        hints: ['Merge operations are vulnerable.', '__proto__', '{"__proto__": {"isAdmin": true}}'],
        explanation: 'Prototype pollution allows attackers to modify the prototype of base objects, affecting all objects in the application.'
    },
    {
        id: 'nmap-101',
        title: 'Open Port Recon',
        category: 'Network Security',
        difficulty: 'Easy',
        description: 'We need to know which port is open on the target server (192.168.1.100). Run a scan.',
        flag: 'CTF{port_8080_open}',
        hints: ['Use the "nmap" command.', 'Target IP is 192.168.1.100'],
        explanation: 'Nmap is used to discover hosts and services on a computer network by sending packets and analyzing the responses.',
        simulation: {
            tool: 'nmap',
            command_trigger: 'nmap',
            output: 'Starting Nmap 7.94\nNmap scan report for 192.168.1.100\nHost is up (0.0010s latency).\nNot shown: 999 closed ports\nPORT     STATE SERVICE\n8080/tcp open  http-proxy\n\nNmap done: 1 IP address (1 host up) scanned in 0.15 seconds'
        }
    }
];

import db from '../db';

class ChallengeStore {
    getAll() {
        // Get static challenges
        const staticChallenges = challenges;

        // Get dynamic challenges from DB
        try {
            const rows = db.prepare('SELECT data FROM challenges').all();
            const dynamicChallenges = rows.map(row => JSON.parse(row.data));

            // Merge and Deduplicate (prefer DB version)
            const allChallenges = [...dynamicChallenges];
            const dbIds = new Set(dynamicChallenges.map(c => c.id));

            staticChallenges.forEach(sc => {
                if (!dbIds.has(sc.id)) {
                    allChallenges.push(sc);
                }
            });

            return allChallenges;
        } catch (error) {
            console.error("Failed to load challenges from DB:", error);
            return staticChallenges;
        }
    }

    getById(id) {
        return this.getAll().find(c => c.id === id);
    }

    getByCategory(category) {
        return this.getAll().filter(c => c.category === category);
    }

    add(challenge) {
        try {
            const stmt = db.prepare('INSERT OR REPLACE INTO challenges (id, data) VALUES (?, ?)');
            stmt.run(challenge.id, JSON.stringify(challenge));
        } catch (error) {
            console.error("Failed to save challenge to DB:", error);
        }
    }
}

export const challengeStore = new ChallengeStore();
