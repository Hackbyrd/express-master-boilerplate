release: yarn migrate:prod
web: node --optimize_for_size --max_old_space_size=460 --gc_interval=100 nolazy_sweeping=true gc_global=true index.js
clock: node cronjobs.js
