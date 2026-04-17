#!/bin/bash
	echo '<odoo><data>'

for i in ./imgs/*
do

  img=$(base64 $i)
  name=$(echo "$i" | sed 's/.jpeg//' | cut -c8-)

	echo '<record id="roma.template_'$name'" model="roma.template">'
	echo '<field name="name">'$i'</field>'
	echo '<field name="type">'$name'</field>'
	echo '<field name="image">'"$img"'</field>'
	echo '</record>'
done
	echo '</data></odoo>'