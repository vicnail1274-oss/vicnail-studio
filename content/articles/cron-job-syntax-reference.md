---
title: "Cron Job Syntax: The Complete Reference Guide"
description: "Master cron job syntax with this complete reference. Covers the five-field format, special characters, common examples, timezone handling, and cron alternatives."
keywords: ["cron job syntax", "cron syntax guide", "cron expression", "crontab syntax", "cron job examples"]
canonical: "https://devplaybook.cc/blog/cron-job-syntax-reference"
date: "2025-03-20"
tags: ["devops", "linux", "automation", "cron", "scheduling"]
slug: "cron-job-syntax-reference"
---

# Cron Job Syntax: The Complete Reference Guide

Cron is the Unix job scheduler. It runs commands on a schedule defined by a 5-field expression. Simple in concept, occasionally tricky in practice — especially with timezone handling, special characters, and platform differences.

This reference covers everything you need to write, read, and debug cron expressions.

---

## The Cron Expression Format

A cron expression has 5 fields separated by spaces:

```
┌──────────── minute (0–59)
│  ┌─────────── hour (0–23)
│  │  ┌────────── day of month (1–31)
│  │  │  ┌───────── month (1–12)
│  │  │  │  ┌──────── day of week (0–7, Sunday = 0 or 7)
│  │  │  │  │
*  *  *  *  *  command
```

Some systems (like AWS EventBridge, Quartz) add a 6th field for seconds — but classic Unix cron uses 5 fields.

---

## Special Characters

| Character | Meaning | Example |
|-----------|---------|---------|
| `*` | Every value | `* * * * *` = every minute |
| `,` | Multiple values | `1,15,30` = at 1, 15, and 30 |
| `-` | Range | `9-17` = every hour from 9 to 17 |
| `/` | Step | `*/15` = every 15 units |
| `@yearly` | Once a year | Alias for `0 0 1 1 *` |
| `@monthly` | Once a month | Alias for `0 0 1 * *` |
| `@weekly` | Once a week | Alias for `0 0 * * 0` |
| `@daily` | Once a day | Alias for `0 0 * * *` |
| `@hourly` | Once an hour | Alias for `0 * * * *` |
| `@reboot` | At startup | Run once at system boot |

---

## Common Cron Examples

```bash
# Every minute
* * * * * /path/to/command

# Every 5 minutes
*/5 * * * * /path/to/command

# Every 15 minutes
*/15 * * * * /path/to/command

# Every hour, on the hour
0 * * * * /path/to/command

# Every day at midnight
0 0 * * * /path/to/command

# Every day at 2:30 AM
30 2 * * * /path/to/command

# Every weekday (Mon-Fri) at 9 AM
0 9 * * 1-5 /path/to/command

# Every Monday at 8 AM
0 8 * * 1 /path/to/command

# First day of every month at midnight
0 0 1 * * /path/to/command

# Every January 1st at midnight (New Year cleanup)
0 0 1 1 * /path/to/command

# Every 6 hours
0 */6 * * * /path/to/command

# At 9 AM, 12 PM, and 6 PM
0 9,12,18 * * * /path/to/command

# Every 30 minutes between 9 AM and 5 PM on weekdays
*/30 9-17 * * 1-5 /path/to/command

# Every Sunday at 3 AM (weekly database backup)
0 3 * * 0 /backup/db.sh

# On the 1st and 15th of each month
0 0 1,15 * * /path/to/billing-script

# Every 10 minutes from 8 AM to 10 PM
*/10 8-22 * * * /path/to/command
```

---

## Setting Up Crontab

Edit your crontab:

```bash
crontab -e          # Edit current user's crontab
crontab -l          # List current crontab
crontab -r          # Remove your crontab (careful!)
sudo crontab -e     # Edit root's crontab
```

Example crontab entries:

```bash
# m h  dom mon dow   command
0 2 * * * /home/user/backup.sh >> /var/log/backup.log 2>&1
*/5 * * * * /usr/bin/python3 /home/user/monitor.py
0 9 * * 1-5 /usr/bin/node /home/user/reports/daily.js
```

### System Crontab (`/etc/crontab`)

The system crontab has an extra field for the user:

```bash
# m h dom mon dow user  command
0 2 * * * root    /usr/sbin/backup.sh
```

### Cron Directories

Drop scripts directly into these directories (no crontab editing needed):

```
/etc/cron.hourly/    → runs every hour
/etc/cron.daily/     → runs every day
/etc/cron.weekly/    → runs every week
/etc/cron.monthly/   → runs every month
```

Scripts must be executable and have no extension:

```bash
chmod +x /etc/cron.daily/my-backup
# No .sh extension needed in cron directories
```

---

## Output and Logging

By default, cron emails output to the system user. To redirect:

```bash
# Discard all output
* * * * * command > /dev/null 2>&1

# Log stdout only
* * * * * command >> /var/log/myapp.log

# Log both stdout and stderr
* * * * * command >> /var/log/myapp.log 2>&1

# Log with timestamps
* * * * * date >> /var/log/myapp.log && command >> /var/log/myapp.log 2>&1
```

Disable email for all cron jobs:

```bash
MAILTO=""

# Your cron jobs below
0 2 * * * /backup/script.sh
```

---

## Environment and PATH Issues

Cron runs with a minimal environment. The most common cron failure is "command not found" because `PATH` is limited.

```bash
# Check your PATH in terminal
echo $PATH
# /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/user/.nvm/node/bin

# Cron's default PATH is typically just:
# /usr/bin:/bin
```

**Fix: Set PATH explicitly in crontab:**

```bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/user/.nvm/node/bin
MAILTO=""

0 * * * * node /path/to/script.js
```

Or use absolute paths in the command:

```bash
# Instead of: node /path/to/script.js
/home/user/.nvm/versions/node/v20.0.0/bin/node /path/to/script.js
```

Or source your profile at the start of scripts:

```bash
#!/bin/bash
source /home/user/.bash_profile
# Rest of script...
```

---

## Timezone Handling

By default, cron uses the system timezone. To set a timezone in crontab:

```bash
CRON_TZ=America/New_York

# Runs at 9 AM New York time, regardless of server timezone
0 9 * * 1-5 /path/to/command
```

Or per-job using system TZ:

```bash
# Using TZ= prefix (supported on most Linux systems)
0 9 * * 1-5 TZ="America/New_York" /path/to/command
```

Check your system timezone:

```bash
timedatectl status
cat /etc/timezone
```

**Cloud deployment note:** Containers and cloud VMs often default to UTC. Always set your timezone explicitly if you're scheduling business hours.

---

## Debugging Cron Jobs

### Verify cron is running

```bash
# Check cron service status
systemctl status cron      # Ubuntu/Debian
systemctl status crond     # CentOS/RHEL

# View cron logs
grep CRON /var/log/syslog           # Ubuntu/Debian
journalctl -u cron --since today    # systemd systems
grep crond /var/log/cron            # CentOS/RHEL
```

### Test your script manually first

```bash
bash /path/to/script.sh
# Confirm it works before scheduling
```

### Test with the same environment as cron

```bash
# Run your command as cron would (minimal environment)
env -i HOME=/home/user LOGNAME=user PATH=/usr/bin:/bin bash -c '/path/to/command'
```

### Add verbose logging to your script

```bash
#!/bin/bash
exec >> /var/log/myscript.log 2>&1
echo "Started at $(date)"
# script commands...
echo "Finished at $(date)"
```

---

## Cron in Modern Contexts

### Docker / Container Cron

In containers, cron typically runs as a background process:

```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y cron

COPY mycrontab /etc/cron.d/mycrontab
RUN chmod 0644 /etc/cron.d/mycrontab && crontab /etc/cron.d/mycrontab

CMD ["cron", "-f"]
```

### GitHub Actions Schedule

```yaml
on:
  schedule:
    - cron: '0 9 * * 1-5'  # Weekdays at 9 AM UTC
```

### Node.js: node-cron

```javascript
import cron from 'node-cron';

// Run every minute
cron.schedule('* * * * *', () => {
  console.log('Running task');
});

// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  await runDailyBackup();
}, {
  timezone: 'America/New_York'
});
```

### Python: APScheduler

```python
from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

@scheduler.scheduled_job('cron', hour=2, minute=0)
def daily_backup():
    run_backup()

@scheduler.scheduled_job('interval', minutes=15)
def health_check():
    check_services()

scheduler.start()
```

---

## Quick Reference Card

```
Every minute:                * * * * *
Every 5 minutes:             */5 * * * *
Every hour:                  0 * * * *
Midnight daily:              0 0 * * *
Every Sunday 3 AM:           0 3 * * 0
Weekdays 9 AM:               0 9 * * 1-5
1st of month midnight:       0 0 1 * *
Every 6 hours:               0 */6 * * *
Three times a day:           0 8,12,18 * * *
Mon-Fri, every 30 min, 9-5:  */30 9-17 * * 1-5
```

---

## Summary

- Cron uses 5 fields: minute, hour, day-of-month, month, day-of-week
- `*` = any, `/` = step, `-` = range, `,` = list
- Always set `PATH` or use absolute paths — cron's environment is minimal
- Set `MAILTO=""` to suppress email; redirect output to logs with `>> logfile 2>&1`
- Set timezone explicitly with `CRON_TZ` if scheduling business hours
- Test scripts manually before scheduling; check `/var/log/syslog` for cron output

---

Schedule and automate your dev workflows. Explore more tools at [devplaybook.cc](https://devplaybook.cc).
