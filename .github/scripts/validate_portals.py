"""Validate the portal data files in _data/portals.

Errors (fail the build):
  - a file isn't valid JSON or doesn't match PortalGroup.schema.json
  - a primaryURL or secondary URL has leading/trailing spaces or isn't http(s)
  - the same primaryURL appears twice in the same group

Warnings (shown in the run, don't fail):
  - the same primaryURL appears more than once elsewhere (another group or page).
    Some of these are intentional, e.g. a portal listed for both admins and end users.
"""
import glob
import json
import os
import sys
from collections import defaultdict

from jsonschema import Draft7Validator

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '_data', 'portals')
SCHEMA = os.path.join(ROOT, 'PortalGroup.schema.json')


def norm(url):
    return url.strip().lower().rstrip('/')


def main():
    validator = Draft7Validator(json.load(open(SCHEMA, encoding='utf-8')))
    errors, warnings = [], []
    seen = defaultdict(list)  # normalised url -> [(file, group, name)]

    files = sorted(f for f in glob.glob(os.path.join(ROOT, '*.json')) if not f.endswith('.schema.json'))
    for path in files:
        name = os.path.basename(path)
        try:
            data = json.load(open(path, encoding='utf-8'))
        except json.JSONDecodeError as e:
            errors.append(f'{name}: invalid JSON: {e}')
            continue
        for err in validator.iter_errors(data):
            where = '/'.join(str(p) for p in err.absolute_path)
            errors.append(f'{name}: schema error at {where or "(root)"}: {err.message}')

        for group in data if isinstance(data, list) else []:
            in_group = set()
            for portal in group.get('portals', []):
                title = portal.get('portalName', '?')
                urls = [portal.get('primaryURL', '')] + [s.get('url', '') for s in portal.get('secondaryURLs') or []]
                for url in urls:
                    if url != url.strip():
                        errors.append(f'{name}: "{title}" has spaces around its URL: {url!r}')
                    if url and not url.strip().lower().startswith(('http://', 'https://')):
                        errors.append(f'{name}: "{title}" URL is not http(s): {url!r}')
                primary = norm(portal.get('primaryURL', ''))
                if not primary:
                    continue
                if primary in in_group:
                    errors.append(f'{name}: "{title}" duplicates another entry in group "{group.get("groupName")}": {primary}')
                in_group.add(primary)
                seen[primary].append((name, group.get('groupName'), title))

    for url, where in sorted(seen.items()):
        if len(where) > 1 and len({(f, g) for f, g, _ in where}) > 1:
            places = '; '.join(f'{f} > {g} > {t}' for f, g, t in where)
            warnings.append(f'{url} is listed {len(where)} times: {places}')

    for w in warnings:
        print(f'::warning::{w}')
    for e in errors:
        print(f'::error::{e}')
    print(f'Checked {len(files)} files: {len(errors)} errors, {len(warnings)} duplicate-URL warnings.')
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
