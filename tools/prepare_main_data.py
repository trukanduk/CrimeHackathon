#!/usr/bin/env python3

import argparse
import re
import json

FIELDS = ["indicator", "district", "upperdistrict", "value", "year"]
def main(args):
	result = []
	for index, line in enumerate(args.inp):
		line = line.strip()
		if (index == 0 and not args.noskipheader) or not line.strip():
			continue

		datum = dict(zip(FIELDS, line.split(',')[1:]))
		if not datum["value"]:
			continue

		datum["year"] = int(datum["year"])
		datum["value"] = float(datum["value"])

		result.append(datum)

	print("var {} = ".format(args.varname), file=args.outp, end="")
	json.dump(result, args.outp)

if __name__ == "__main__":
	parser = argparse.ArgumentParser("Tool for translating data from csv to json.")
	parser.add_argument("inp", type=argparse.FileType("r", encoding="utf8"), help="input file (*csv)")
	parser.add_argument("outp", type=argparse.FileType("w", encoding="utf8"), help="output file (*.json|*.js)")
	parser.add_argument("-varname", default="kCrimesData", help="Variable name")
	parser.add_argument("-noskipheader", action="store_true", default=False, help="Skip first line (headers)")
	args = parser.parse_args()

	main(args)
