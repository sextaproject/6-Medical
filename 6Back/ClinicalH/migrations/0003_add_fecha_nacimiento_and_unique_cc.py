# Generated migration to add fecha_nacimiento and make CC unique

from django.db import migrations, models
from django.db.models import Q
import django.utils.timezone


def populate_cc_for_existing_patients(apps, schema_editor):
    """Populate CC for existing patients that don't have one"""
    Patient = apps.get_model('ClinicalH', 'Patient')
    for patient in Patient.objects.filter(Q(cc__isnull=True) | Q(cc='')):
        # Generate a temporary CC based on patient ID if missing
        patient.cc = f'TEMP{patient.id:06d}'
        patient.save()


class Migration(migrations.Migration):

    dependencies = [
        ('ClinicalH', '0002_noteedithistory'),
    ]

    operations = [
        # First, populate CC for existing patients
        migrations.RunPython(populate_cc_for_existing_patients, migrations.RunPython.noop),
        
        # Add fecha_nacimiento field (nullable for existing records)
        migrations.AddField(
            model_name='patient',
            name='fecha_nacimiento',
            field=models.DateField(blank=True, null=True, verbose_name='Fecha de nacimiento'),
        ),
        # Make edad nullable (since it can be calculated from fecha_nacimiento)
        migrations.AlterField(
            model_name='patient',
            name='edad',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='Edad'),
        ),
        # Make CC unique and required (remove null/blank)
        migrations.AlterField(
            model_name='patient',
            name='cc',
            field=models.CharField(max_length=20, unique=True, verbose_name='Cédula de ciudadanía (ID)'),
        ),
    ]
