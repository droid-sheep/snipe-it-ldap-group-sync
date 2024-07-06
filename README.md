# README

## Overview

This Node.js script synchronizes user group memberships from an Active Directory to Snipe-IT. It has been tested with Node.js LTS version 20.15, but should work with other versions as well. The script is intended as a quick solution and should be used with caution in production environments.

## Prerequisites

- Node.js (tested with LTS version 20.15)
- Groups with the same names must exist in both Active Directory and Snipe-IT. Otherwise, the groups will not be synchronized.

## Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/droid-sheep/snipe-it-ldap-group-sync.git
    cd snipe-it-ldap-group-sync
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Configure parameters:**
   Edit the `app.js` file to set the required parameters at the top of the file:
    ```js
    const ldapHost = "<Your_LDAP_Server>";
	const bindUser = "<Your_LDAP_Admin_User_DN>";
	const bindPassword = "<Your_LDAP_Admin_User_Password>";

	const snipeServer = "<Your_Public_Snipe_Instance_Base_URL>";
	const snipePassword = "<Your_Snipe_API_Key>";

	const ldapGroupDN = "<DN_of_Your_Users>";
	const ldapUserDN = "<DN_of_Your_Groups>";

	const ldapTimeout = 60; //one try waits for 1 sec
    ```

## Usage

To run the script manually:
```sh
node app.js
```

## Automation

To run the script regularly, set up a cron job on your system. For example, to run the script every day at midnight:

1. Open your crontab file:
    ```sh
    crontab -e
    ```

2. Add the following line:
    ```sh
    0 0 * * * /usr/bin/node /path/to/your/repository/app.js
    ```

Replace `/usr/bin/node` with the path to your Node.js binary and `/path/to/your/repository/app.js` with the path to your script.

## Development and Contributions

This script was written quickly and is intended to be a starting point. If you are interested in improving it, feel free to contribute. Contributions and feedback are highly welcome!

1. **Fork the repository**

2. **Create a new branch for your feature or bugfix:**
    ```sh
    git checkout -b feature-or-bugfix-name
    ```

3. **Commit your changes:**
    ```sh
    git commit -m 'Description of feature or bugfix'
    ```

4. **Push to the branch:**
    ```sh
    git push origin feature-or-bugfix-name
    ```

5. **Create a pull request**

## Disclaimer

This script is provided as-is with no warranties. It is recommended to thoroughly test it in a non-production environment before using it in production.

## Contact

If you have any questions or suggestions, feel free to open an issue or contact me directly.

---

Thank you for using this script! If there is enough interest, I am willing to develop it further. Your contributions and feedback are appreciated.